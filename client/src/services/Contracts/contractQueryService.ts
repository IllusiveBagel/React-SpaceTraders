import axiosManager from "services/axiosManager";

const getContracts = () => {
    return axiosManager.get("/my/contracts");
};

const getContract = (contractId: string) => {
    return axiosManager.get(`/my/contracts/${contractId}`);
};

export { getContracts, getContract };
