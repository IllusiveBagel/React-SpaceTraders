import { create } from "zustand";
import { devtools } from "zustand/middleware";

import type { Ship, ShipNav, ShipCargo, ShipFuel } from "types/Ship";
import type { Agent } from "types/Agent";
import type { Cooldown } from "types/Cooldown";
import type { Contract } from "types/Contract/Contract";
import type { Waypoint } from "types/Waypoint";

interface SpaceTradersState {
    agent: Agent;
    contracts: Contract[];
    waypoints: Waypoint[];
    ships: Ship[];
    setAgent: (agent: Agent) => void;
    setContracts: (contracts: Contract[]) => void;
    setWaypoints: (waypoints: Waypoint[]) => void;
    setShips: (ships: Ship[]) => void;
    setShipNav: (shipSymbol: string, nav: ShipNav) => void;
    setShipFuel: (shipSymbol: string, fuel: ShipFuel) => void;
    setShipCargo: (shipSymbol: string, cargo: ShipCargo) => void;
    setShipCooldown: (shipSymbol: string, cooldown: Cooldown) => void;
}

export const useSpaceTradersStore = create(
    devtools((set) => ({
        // Store
        agent: {} as Agent,
        contracts: [] as Contract[],
        waypoints: [] as Waypoint[],
        ships: [] as Ship[],

        // Actions
        setAgent: (agent: Agent) => set({ agent }),
        setContracts: (contracts: Contract[]) => set({ contracts }),
        setWaypoints: (waypoints: Waypoint[]) => set({ waypoints }),
        setShips: (ships: Ship[]) => set({ ships }),
        setShipNav: (shipSymbol: string, nav: ShipNav) =>
            set((state: SpaceTradersState) => ({
                ships: state.ships.map((ship) =>
                    ship.symbol === shipSymbol ? { ...ship, nav } : ship,
                ),
            })),
        setShipFuel: (shipSymbol: string, fuel: ShipFuel) =>
            set((state: SpaceTradersState) => ({
                ships: state.ships.map((ship) =>
                    ship.symbol === shipSymbol ? { ...ship, fuel } : ship,
                ),
            })),
        setShipCargo: (shipSymbol: string, cargo: ShipCargo) =>
            set((state: SpaceTradersState) => ({
                ships: state.ships.map((ship) =>
                    ship.symbol === shipSymbol ? { ...ship, cargo } : ship,
                ),
            })),
        setShipCooldown: (shipSymbol: string, cooldown: Cooldown) =>
            set((state: SpaceTradersState) => ({
                ships: state.ships.map((ship) =>
                    ship.symbol === shipSymbol ? { ...ship, cooldown } : ship,
                ),
            })),
    })),
);
