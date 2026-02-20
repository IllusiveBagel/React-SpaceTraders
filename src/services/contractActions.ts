import axiosManager from "services/axiosManager";

type DeliverContractPayload = {
    shipSymbol: string;
    tradeSymbol: string;
    units: number;
};

const deliverContract = (
    contractId: string,
    payload: DeliverContractPayload,
) => {
    return axiosManager.post(`/my/contracts/${contractId}/deliver`, payload);
};

const fulfillContract = (contractId: string) => {
    return axiosManager.post(`/my/contracts/${contractId}/fulfill`);
};

const negotiateContract = (shipSymbol: string) => {
    return axiosManager.post(`/my/ships/${shipSymbol}/negotiate/contract`);
};

export { deliverContract, fulfillContract, negotiateContract };
