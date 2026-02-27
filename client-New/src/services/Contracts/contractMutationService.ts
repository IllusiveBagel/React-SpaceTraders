import axiosManager from "services/axiosManager";
import type { TradeSymbol } from "types/Common";

const acceptContract = (contractId: string) => {
    return axiosManager.post(`/my/contracts/${contractId}/accept`);
};

const fulfillContract = (contractId: string) => {
    return axiosManager.post(`/my/contracts/${contractId}/fulfill`);
};

const deliverCargoToContract = (
    contractId: string,
    shipSymbol: string,
    tradeSymbol: TradeSymbol,
    units: number,
) => {
    return axiosManager.post(`/my/contracts/${contractId}/deliver`, {
        shipSymbol,
        tradeSymbol,
        units,
    });
};

const negotiateContract = (shipSymbol: string) => {
    return axiosManager.post(`/my/ships/${shipSymbol}/negotiate/contract`);
};

export {
    acceptContract,
    fulfillContract,
    deliverCargoToContract,
    negotiateContract,
};
