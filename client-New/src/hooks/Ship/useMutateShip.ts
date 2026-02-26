import { useMutation } from "@tanstack/react-query";
import {
    createChart,
    dockShip,
    extractResources,
    extractResourcesWithSurvey,
    jettisonCargo,
    jumpShip,
    negotiateContract,
    purchaseShip,
    scanSystems,
    scanWaypoints,
    scanShips,
    scrapShip,
    navigateShip,
    warpShip,
    orbitShip,
    purchaseCargo,
} from "../../services/Ship/shipMutationService";
import type { Survey } from "../../types/Survey";
import type {
    Ship,
    ShipCargo,
    ShipNav,
    ShipConditionEvent,
    ScannedShip,
    ShipFuel,
} from "../../types/Ship";
import type {
    Transaction,
    Chart,
    Extraction,
    TradeSymbol,
} from "../../types/Common";
import type { Agent } from "../../types/Agent";
import type { Waypoint } from "../../types/Waypoint";
import type { Contract } from "../../types/Contract";
import type { WaypointModifier } from "../../types/Waypoint";
import type { Cooldown } from "../../types/Cooldown";
import type { ScannedSystem } from "../../types/System";
import type { ScannedWaypoint } from "../../types/Waypoint/ScannedWaypoint";

const useMutateShip = (shipSymbol?: string) => {
    const purchaseShipMutation = useMutation({
        mutationKey: ["purchaseShip"],
        mutationFn: async ({
            shipType,
            location,
        }: {
            shipType: string;
            location: string;
        }) => {
            return (await purchaseShip(shipType, location)).data.data as {
                ship: Ship;
                agent: Agent;
                transaction: Transaction;
            };
        },
    });

    const createChartMutation = useMutation({
        mutationKey: ["createChart", shipSymbol],
        mutationFn: async () => {
            if (!shipSymbol) {
                throw new Error("Ship symbol is required to create a chart");
            }
            return (await createChart(shipSymbol)).data.data as {
                chart: Chart;
                waypoint: Waypoint;
                transaction: Transaction;
                agent: Agent;
            };
        },
    });

    const negotiateContractMutation = useMutation({
        mutationKey: ["negotiateContract", shipSymbol],
        mutationFn: async () => {
            if (!shipSymbol) {
                throw new Error(
                    "Ship symbol is required to negotiate a contract",
                );
            }
            return (await negotiateContract(shipSymbol)).data.data as {
                contract: Contract;
            };
        },
    });

    const dockShipMutation = useMutation({
        mutationKey: ["dockShip", shipSymbol],
        mutationFn: async () => {
            if (!shipSymbol) {
                throw new Error("Ship symbol is required to dock the ship");
            }
            return (await dockShip(shipSymbol)).data.data as { nav: ShipNav };
        },
    });

    const extractResourcesMutation = useMutation({
        mutationKey: ["extractResources", shipSymbol],
        mutationFn: async () => {
            if (!shipSymbol) {
                throw new Error("Ship symbol is required to extract resources");
            }
            return (await extractResources(shipSymbol)).data.data as {
                extraction: Extraction;
                cooldown: Cooldown;
                cargo: ShipCargo;
                modifiers: WaypointModifier[];
                events: ShipConditionEvent[];
            };
        },
    });

    const extractResourcesWithSurveyMutation = useMutation({
        mutationKey: ["extractResourcesWithSurvey", shipSymbol],
        mutationFn: async (survey: Survey) => {
            if (!shipSymbol) {
                throw new Error(
                    "Ship symbol is required to extract resources with survey",
                );
            }
            return (await extractResourcesWithSurvey(shipSymbol, survey)).data
                .data as {
                extraction: Extraction;
                cooldown: Cooldown;
                cargo: ShipCargo;
                modifiers: WaypointModifier[];
                events: ShipConditionEvent[];
            };
        },
    });

    const jettisonCargoMutation = useMutation({
        mutationKey: ["jettisonCargo", shipSymbol],
        mutationFn: async ({
            cargoSymbol,
            units,
        }: {
            cargoSymbol: string;
            units: number;
        }) => {
            if (!shipSymbol) {
                throw new Error("Ship symbol is required to jettison cargo");
            }
            return (await jettisonCargo(shipSymbol, cargoSymbol, units)).data
                .data as { cargo: ShipCargo };
        },
    });

    const jumpShipMutation = useMutation({
        mutationKey: ["jumpShip", shipSymbol],
        mutationFn: async (waypointSymbol: string) => {
            if (!shipSymbol) {
                throw new Error("Ship symbol is required to jump");
            }
            return (await jumpShip(shipSymbol, waypointSymbol)).data.data as {
                nav: ShipNav;
                cooldown: Cooldown;
                transaction: Transaction;
                agent: Agent;
            };
        },
    });

    const scanSystemsMutation = useMutation({
        mutationKey: ["scanSystems", shipSymbol],
        mutationFn: async () => {
            if (!shipSymbol) {
                throw new Error("Ship symbol is required to scan systems");
            }
            return (await scanSystems(shipSymbol)).data.data as {
                cooldown: Cooldown;
                systems: ScannedSystem[];
            };
        },
    });

    const scanWaypointsMutation = useMutation({
        mutationKey: ["scanWaypoints", shipSymbol],
        mutationFn: async () => {
            if (!shipSymbol) {
                throw new Error("Ship symbol is required to scan waypoints");
            }
            return (await scanWaypoints(shipSymbol)).data.data as {
                cooldown: Cooldown;
                waypoints: ScannedWaypoint[];
            };
        },
    });

    const scanShipsMutation = useMutation({
        mutationKey: ["scanShips", shipSymbol],
        mutationFn: async () => {
            if (!shipSymbol) {
                throw new Error("Ship symbol is required to scan ships");
            }
            return (await scanShips(shipSymbol)).data.data as {
                cooldown: Cooldown;
                ships: ScannedShip[];
            };
        },
    });

    const scrapShipMutation = useMutation({
        mutationKey: ["scrapShip", shipSymbol],
        mutationFn: async () => {
            if (!shipSymbol) {
                throw new Error("Ship symbol is required to scrap the ship");
            }
            return (await scrapShip(shipSymbol)).data.data as {
                agent: Agent;
                transaction: Transaction;
            };
        },
    });

    const navigateShipMutation = useMutation({
        mutationKey: ["navigateShip", shipSymbol],
        mutationFn: async (waypointSymbol: string) => {
            if (!shipSymbol) {
                throw new Error("Ship symbol is required to navigate the ship");
            }
            return (await navigateShip(shipSymbol, waypointSymbol)).data
                .data as {
                nav: ShipNav;
                fuel: ShipFuel;
                events: ShipConditionEvent[];
            };
        },
    });

    const warpShipMutation = useMutation({
        mutationKey: ["warpShip", shipSymbol],
        mutationFn: async (waypointSymbol: string) => {
            if (!shipSymbol) {
                throw new Error("Ship symbol is required to warp the ship");
            }
            return (await warpShip(shipSymbol, waypointSymbol)).data.data as {
                nav: ShipNav;
                fuel: ShipFuel;
                events: ShipConditionEvent[];
            };
        },
    });

    const orbitShipMutation = useMutation({
        mutationKey: ["orbitShip", shipSymbol],
        mutationFn: async () => {
            if (!shipSymbol) {
                throw new Error("Ship symbol is required to orbit the ship");
            }
            return (await orbitShip(shipSymbol)).data.data as {
                nav: ShipNav;
            };
        },
    });

    const purchaseCargoMutation = useMutation({
        mutationKey: ["purchaseCargo", shipSymbol],
        mutationFn: async ({
            symbol,
            units,
        }: {
            symbol: TradeSymbol;
            units: number;
        }) => {
            if (!shipSymbol) {
                throw new Error("Ship symbol is required to purchase cargo");
            }
            return (await purchaseCargo(shipSymbol, symbol, units)).data
                .data as {
                cargo: ShipCargo;
                transaction: Transaction;
                agent: Agent;
            };
        },
    });

    return {
        purchaseShip: purchaseShipMutation,
        createChart: createChartMutation,
        negotiateContract: negotiateContractMutation,
        dockShip: dockShipMutation,
        extractResources: extractResourcesMutation,
        extractResourcesWithSurvey: extractResourcesWithSurveyMutation,
        jettisonCargo: jettisonCargoMutation,
        jumpShip: jumpShipMutation,
        scanShips: scanShipsMutation,
        scanSystems: scanSystemsMutation,
        scanWaypoints: scanWaypointsMutation,
        scrapShip: scrapShipMutation,
        navigateShip: navigateShipMutation,
        warpShip: warpShipMutation,
        orbitShip: orbitShipMutation,
        purchaseCargo: purchaseCargoMutation,
    };
};

export default useMutateShip;
