type MarketItem = {
    symbol: string;
    name: string;
    description: string;
};

type TradeGood = {
    symbol: string;
    type: string;
    tradeVolume: number;
    supply: string;
    activity?: string;
    purchasePrice: number;
    sellPrice: number;
};

type MarketTransaction = {
    waypointSymbol: string;
    shipSymbol: string;
    tradeSymbol: string;
    type: string;
    units: number;
    pricePerUnit: number;
    totalPrice: number;
    timestamp: string;
};

type Market = {
    symbol: string;
    imports?: MarketItem[];
    exports?: MarketItem[];
    exchange?: MarketItem[];
    tradeGoods?: TradeGood[];
    transactions?: MarketTransaction[];
};

export type { Market, MarketItem, MarketTransaction, TradeGood };
