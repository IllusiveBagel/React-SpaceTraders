import { create } from "zustand";

import type { Ship } from "../types/Ship";
import type { Contract } from "../types/Contract";

interface SpaceTradersState {
    ships: Ship[];
    contracts: Contract[];
    cooldowns: Record<string, number>; // shipId -> cooldown seconds
    setShips: (ships: Ship[]) => void;
    setContracts: (contracts: Contract[]) => void;
    setCooldown: (shipId: string, cooldown: number) => void;
    decrementCooldowns: () => void;
}

export const useSpaceTradersStore = create<SpaceTradersState>((set) => ({
    ships: [],
    contracts: [],
    cooldowns: {},
    setShips: (ships: Ship[]) => set({ ships }),
    setContracts: (contracts: Contract[]) => set({ contracts }),
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
