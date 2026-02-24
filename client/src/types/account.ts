type AccountAgent = {
    symbol: string;
    token?: string;
};

type Account = {
    id?: string;
    email?: string;
    agents?: AccountAgent[];
};

export type { Account, AccountAgent };
