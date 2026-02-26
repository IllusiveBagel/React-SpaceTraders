import axiosManager from "services/axiosManager";

const getAgent = () => {
    return axiosManager.get("/my/agent");
};

export { getAgent };
