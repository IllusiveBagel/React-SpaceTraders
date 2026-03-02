import type { TradeSymbol } from "../Common";

export type ShipCargoItem = {
    symbol: TradeSymbol;
    name: string;
    description: string;
    units: number;
};
