type Contract = {
    id: string;
    factionSymbol: string;
    type: "PROCUREMENT";
    terms: {
        deadline: string;
        payment: {
            onAccepted: number;
            onFulfilled: number;
        };
        deliver: {
            tradeSymbol: string;
            destinationSymbol: string;
            unitsRequired: number;
            unitsFulfilled: number;
        }[];
    };
    accepted: boolean;
    fulfilled: boolean;
    deadlineToAccept: string;
};

export type { Contract };
