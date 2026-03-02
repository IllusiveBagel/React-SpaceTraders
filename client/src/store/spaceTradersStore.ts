import { create } from "zustand";

import type { Ship, ShipNav, ShipCargo, ShipFuel } from "types/Ship";
import type { Agent } from "types/Agent";
import type { Cooldown } from "types/Cooldown";
import type { Contract } from "types/Contract/Contract";
import type { Waypoint } from "types/Waypoint";
import type { System } from "types/System";

export interface SpaceTradersState {
    agent: Agent;
    contracts: Contract[];
    system: System;
    ships: Ship[];
    setAgent: (agent: Agent) => void;
    setContracts: (contracts: Contract[]) => void;
    setSystem: (system: System) => void;
    setSystemWaypoints: (waypoints: Waypoint[]) => void;
    setShips: (ships: Ship[]) => void;
    setShipNav: (shipSymbol: string, nav: ShipNav) => void;
    setShipFuel: (shipSymbol: string, fuel: ShipFuel) => void;
    setShipCargo: (shipSymbol: string, cargo: ShipCargo) => void;
    setShipCooldown: (shipSymbol: string, cooldown: Cooldown) => void;
}

export const useSpaceTradersStore = create((set) => ({
    // Store
    agent: {} as Agent,
    contracts: [] as Contract[],
    system: {} as System,
    ships: [] as Ship[],

    // Actions
    setAgent: (agent: Agent) => set({ agent }),
    setContracts: (contracts: Contract[]) => set({ contracts }),
    setSystem: (system: System) => set({ system }),
    setSystemWaypoints: (waypoints: Waypoint[]) =>
        set((state: SpaceTradersState) => ({
            system: { ...state.system, waypoints },
        })),
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
}));
