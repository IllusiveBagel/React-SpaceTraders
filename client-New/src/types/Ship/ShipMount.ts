import type { Deposits, Requirements } from "../Common";

export type ShipMount = {
    symbol: string;
    name: string;
    description: string;
    strength: number;
    deposits: Deposits[];
    requirements: Requirements;
};
