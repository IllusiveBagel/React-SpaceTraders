import type { Ship } from "types/fleet";
import type { MiningAutomationConfig } from "./types";

type AutomationActions = {
    dock: () => Promise<unknown>;
    orbit: () => Promise<unknown>;
    navigate: (waypointSymbol: string) => Promise<unknown>;
    extract: () => Promise<unknown>;
    sell: (symbol: string, units: number) => Promise<unknown>;
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

export { runMiningAutomationStep };
