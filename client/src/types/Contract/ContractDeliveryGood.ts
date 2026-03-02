import type { TradeSymbol } from "../Common";

export type ContractDeliverGood = {
    tradeSymbol: TradeSymbol;
    destinationSymbol: string;
    unitsRequired: number;
    unitsFulfilled: number;
};
