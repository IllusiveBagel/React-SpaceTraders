import { create } from "zustand";
import { devtools } from "zustand/middleware";

import type { Ship } from "types/Ship";
import type { Agent } from "types/Agent";

interface SpaceTradersState {
    agent: Agent;
    setAgent: (agent: Agent) => void;
    ships: Ship[];
    setShips: (ships: Ship[]) => void;
}

export const useSpaceTradersStore = create(
    devtools((set) => ({
        // Store
        agent: {} as Agent,
        ships: [] as Ship[],

        // Actions
        setAgent: (agent: Agent) => set({ agent }),
        setShips: (ships: Ship[]) => set({ ships }),
    })),
);
