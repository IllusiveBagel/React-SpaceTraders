import axiosManager from "services/axiosManager";

const purchaseShip = (shipType: string, location: string) => {
    return axiosManager.post("/my/ships", {
        shipType,
        location,
    });
};

export { purchaseShip };
