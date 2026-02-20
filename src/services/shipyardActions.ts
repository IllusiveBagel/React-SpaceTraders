import axiosManager from "services/axiosManager";

type PurchaseShipPayload = {
    shipType: string;
    waypointSymbol: string;
};

const purchaseShip = (shipType: string, waypointSymbol: string) => {
    const payload: PurchaseShipPayload = { shipType, waypointSymbol };
    return axiosManager.post("/my/ships", payload);
};

export { purchaseShip };
