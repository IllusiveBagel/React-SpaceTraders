import type { Requirements } from "../Common/Requirements";
import type { Deposits } from "../Common/Deposits";

export type ShipMount = {
    symbol: string;
    name: string;
    description: string;
    strength: number;
    deposits: Deposits[];
    requirements: Requirements;
};
