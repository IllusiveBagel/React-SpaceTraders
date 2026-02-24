import axiosManager from "services/axiosManager";

type PurchaseCargoPayload = {
    symbol: string;
    units: number;
};

type SellCargoPayload = {
    symbol: string;
    units: number;
};

const purchaseCargo = (shipSymbol: string, symbol: string, units: number) => {
    const payload: PurchaseCargoPayload = { symbol, units };
    return axiosManager.post(`/my/ships/${shipSymbol}/purchase`, payload);
};

const sellCargo = (shipSymbol: string, symbol: string, units: number) => {
    const payload: SellCargoPayload = { symbol, units };
    return axiosManager.post(`/my/ships/${shipSymbol}/sell`, payload);
};

export { purchaseCargo, sellCargo };
