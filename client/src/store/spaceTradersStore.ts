import { create } from "zustand";

// Types for ship, contract, and fleet data (import or define as needed)
import type { Ship } from "../types/fleet";
import type { Contract } from "../types/contract";

interface SpaceTradersState {
    ships: Ship[];
    contracts: Contract[];
    fleet: Ship[]; // Adjust if fleet is a different type
    cooldowns: Record<string, number>; // shipId -> cooldown seconds
    setShips: (ships: Ship[]) => void;
    setContracts: (contracts: Contract[]) => void;
    setFleet: (fleet: Ship[]) => void;
    setCooldown: (shipId: string, cooldown: number) => void;
    decrementCooldowns: () => void;
}

export const useSpaceTradersStore = create<SpaceTradersState>((set) => ({
    ships: [],
    contracts: [],
    fleet: [],
    cooldowns: {},
    setShips: (ships: Ship[]) => set({ ships }),
    setContracts: (contracts: Contract[]) => set({ contracts }),
    setFleet: (fleet: Ship[]) => set({ fleet }),
    setCooldown: (shipId: string, cooldown: number) =>
        set((state) => ({
            cooldowns: { ...state.cooldowns, [shipId]: cooldown },
        })),
    decrementCooldowns: () =>
        set((state) => {
            const updated = { ...state.cooldowns };
            Object.keys(updated).forEach((id) => {
                if (updated[id] > 0) updated[id] -= 1;
            });
            return { cooldowns: updated };
        }),
}));

// Optionally, set up an interval to decrement cooldowns globally
if (typeof window !== "undefined") {
    setInterval(() => {
        useSpaceTradersStore.getState().decrementCooldowns();
    }, 1000);
}
