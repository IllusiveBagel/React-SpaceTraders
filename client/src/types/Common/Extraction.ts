import type { TradeSymbol } from "./";

export type Extraction = {
    shipSymbol: string;
    yield: {
        symbol: TradeSymbol;
        units: number;
    };
};
