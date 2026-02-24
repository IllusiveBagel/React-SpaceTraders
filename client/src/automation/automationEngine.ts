import type { Ship } from "types/fleet";
import type { Contract } from "types/contract";
import type { MiningAutomationConfig } from "./types";

type AutomationActions = {
    dock: () => Promise<unknown>;
    orbit: () => Promise<unknown>;
    navigate: (waypointSymbol: string) => Promise<unknown>;
    extract: () => Promise<unknown>;
    sell: (symbol: string, units: number) => Promise<unknown>;
    jettison: (symbol: string, units: number) => Promise<unknown>;
    deliver: (
        contractId: string,
        shipSymbol: string,
        tradeSymbol: string,
        units: number,
    ) => Promise<unknown>;
    fulfill: (contractId: string) => Promise<unknown>;
};

type AutomationDecision = {
    action: string;
    message: string;
};

const getTradeUnits = (ship: Ship, tradeSymbol: string) => {
    const match = ship.cargo.inventory.find(
        (item) => item.symbol === tradeSymbol,
    );
    return match?.units ?? 0;
};

const shouldSellCargo = (ship: Ship, config: MiningAutomationConfig) => {
    const tradeUnits = getTradeUnits(ship, config.tradeSymbol);
    const sellAtUnits = Math.max(1, config.sellAtUnits || ship.cargo.capacity);
    const cargoFull = ship.cargo.units >= ship.cargo.capacity;

    return tradeUnits > 0 && (cargoFull || tradeUnits >= sellAtUnits);
};

const runMiningAutomationStep = async (
    ship: Ship,
    config: MiningAutomationConfig,
    actions: AutomationActions,
): Promise<AutomationDecision> => {
    if (!config.mineWaypoint || !config.marketWaypoint) {
        return {
            action: "idle",
            message: "Missing mine or market waypoint.",
        };
    }

    if (ship.nav.status === "IN_TRANSIT") {
        return {
            action: "idle",
            message: "Ship in transit.",
        };
    }

    const atMine = ship.nav.waypointSymbol === config.mineWaypoint;
    const atMarket = ship.nav.waypointSymbol === config.marketWaypoint;
    const isDocked = ship.nav.status === "DOCKED";
    const canExtract = ship.cooldown.remainingSeconds <= 0;
    const shouldSell = shouldSellCargo(ship, config);

    if (shouldSell) {
        if (!atMarket) {
            if (isDocked) {
                await actions.orbit();
                return {
                    action: "orbit",
                    message: "Orbiting to travel to market.",
                };
            }

            await actions.navigate(config.marketWaypoint);
            return {
                action: "navigate",
                message: `Navigating to market ${config.marketWaypoint}.`,
            };
        }

        if (!isDocked) {
            await actions.dock();
            return { action: "dock", message: "Docking to sell cargo." };
        }

        const tradeUnits = getTradeUnits(ship, config.tradeSymbol);
        if (tradeUnits <= 0) {
            return { action: "idle", message: "No cargo to sell." };
        }

        await actions.sell(config.tradeSymbol, tradeUnits);
        return {
            action: "sell",
            message: `Selling ${tradeUnits} ${config.tradeSymbol}.`,
        };
    }

    if (!atMine) {
        if (isDocked) {
            await actions.orbit();
            return { action: "orbit", message: "Orbiting to travel to mine." };
        }

        await actions.navigate(config.mineWaypoint);
        return {
            action: "navigate",
            message: `Navigating to mine ${config.mineWaypoint}.`,
        };
    }

    if (isDocked) {
        await actions.orbit();
        return { action: "orbit", message: "Orbiting to begin mining." };
    }

    if (!canExtract) {
        return {
            action: "idle",
            message: `Cooldown ${ship.cooldown.remainingSeconds}s remaining.`,
        };
    }

    await actions.extract();
    return { action: "extract", message: "Extracting resources." };
};

const getActiveContract = (contracts: Contract[]) =>
    contracts.find((contract) => contract.accepted && !contract.fulfilled);

const getPendingDelivery = (contract: Contract) =>
    contract.terms.deliver.find(
        (delivery) => delivery.unitsFulfilled < delivery.unitsRequired,
    );

const runContractAutomationStep = async (
    ship: Ship,
    config: MiningAutomationConfig,
    contracts: Contract[],
    actions: AutomationActions,
): Promise<AutomationDecision> => {
    if (!config.mineWaypoint) {
        return {
            action: "idle",
            message: "Missing mine waypoint for contract mode.",
        };
    }

    if (ship.nav.status === "IN_TRANSIT") {
        return { action: "idle", message: "Ship in transit." };
    }

    const contract = getActiveContract(contracts);
    if (!contract) {
        return { action: "idle", message: "No accepted contracts." };
    }

    const pendingDelivery = getPendingDelivery(contract);
    if (!pendingDelivery) {
        await actions.fulfill(contract.id);
        return { action: "fulfill", message: "Fulfilling contract." };
    }

    const deliveryTarget = pendingDelivery.destinationSymbol;
    const deliveryTradeSymbol = pendingDelivery.tradeSymbol;
    const deliveryUnitsRemaining =
        pendingDelivery.unitsRequired - pendingDelivery.unitsFulfilled;
    const tradeUnits = getTradeUnits(ship, deliveryTradeSymbol);
    const atDelivery = ship.nav.waypointSymbol === deliveryTarget;
    const isDocked = ship.nav.status === "DOCKED";
    const isCargoFull =
        ship.cargo.capacity > 0
            ? ship.cargo.units >= ship.cargo.capacity
            : tradeUnits > 0;
    const isCargoOnlyContract = ship.cargo.units === tradeUnits;
    const readyToDeliver = isCargoFull && isCargoOnlyContract;
    const nonContractCargo = ship.cargo.inventory.find(
        (item) => item.symbol !== deliveryTradeSymbol && item.units > 0,
    );

    if (nonContractCargo) {
        if (isDocked) {
            await actions.orbit();
            return {
                action: "orbit",
                message: "Orbiting to jettison non-contract cargo.",
            };
        }

        await actions.jettison(nonContractCargo.symbol, nonContractCargo.units);
        return {
            action: "jettison",
            message: `Jettisoning ${nonContractCargo.units} ${nonContractCargo.symbol}.`,
        };
    }

    if (readyToDeliver && tradeUnits > 0) {
        if (!atDelivery) {
            if (isDocked) {
                await actions.orbit();
                return {
                    action: "orbit",
                    message: "Orbiting to deliver contract cargo.",
                };
            }

            await actions.navigate(deliveryTarget);
            return {
                action: "navigate",
                message: `Navigating to ${deliveryTarget} for delivery.`,
            };
        }

        if (!isDocked) {
            await actions.dock();
            return { action: "dock", message: "Docking to deliver cargo." };
        }

        const unitsToDeliver = Math.min(tradeUnits, deliveryUnitsRemaining);
        if (unitsToDeliver <= 0) {
            return { action: "idle", message: "No contract cargo to deliver." };
        }

        await actions.deliver(
            contract.id,
            ship.symbol,
            deliveryTradeSymbol,
            unitsToDeliver,
        );
        return {
            action: "deliver",
            message: `Delivering ${unitsToDeliver} ${deliveryTradeSymbol}.`,
        };
    }

    const atMine = ship.nav.waypointSymbol === config.mineWaypoint;
    const canExtract = ship.cooldown.remainingSeconds <= 0;

    if (!atMine) {
        if (isDocked) {
            await actions.orbit();
            return {
                action: "orbit",
                message: "Orbiting to mine contract cargo.",
            };
        }

        await actions.navigate(config.mineWaypoint);
        return {
            action: "navigate",
            message: `Navigating to mine ${config.mineWaypoint}.`,
        };
    }

    if (isDocked) {
        await actions.orbit();
        return { action: "orbit", message: "Orbiting to begin mining." };
    }

    if (!canExtract) {
        return {
            action: "idle",
            message: `Cooldown ${ship.cooldown.remainingSeconds}s remaining.`,
        };
    }

    await actions.extract();
    return {
        action: "extract",
        message: `Extracting for contract ${deliveryTradeSymbol}.`,
    };
};

const runAutomationStep = async (
    ship: Ship,
    config: MiningAutomationConfig,
    contracts: Contract[],
    actions: AutomationActions,
): Promise<AutomationDecision> => {
    const mode = config.mode ?? "mine_and_sell";

    if (mode === "contract_jobs") {
        return runContractAutomationStep(ship, config, contracts, actions);
    }

    return runMiningAutomationStep(ship, config, actions);
};

export { runAutomationStep };
