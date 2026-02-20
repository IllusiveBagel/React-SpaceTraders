import axiosManager from "services/axiosManager";

type NavigatePayload = {
    waypointSymbol: string;
};

type SellPayload = {
    symbol: string;
    units: number;
};

const orbitShip = (shipSymbol: string) => {
    return axiosManager.post(`/my/ships/${shipSymbol}/orbit`);
};

const dockShip = (shipSymbol: string) => {
    return axiosManager.post(`/my/ships/${shipSymbol}/dock`);
};

const navigateShip = (shipSymbol: string, waypointSymbol: string) => {
    const payload: NavigatePayload = { waypointSymbol };
    return axiosManager.post(`/my/ships/${shipSymbol}/navigate`, payload);
};

const extractResources = (shipSymbol: string) => {
    return axiosManager.post(`/my/ships/${shipSymbol}/extract`);
};

type RefuelPayload = {
    fromCargo?: boolean;
};

const refuelShip = (shipSymbol: string, payload?: RefuelPayload) => {
    const requestPayload = payload?.fromCargo ? payload : undefined;
    return axiosManager.post(`/my/ships/${shipSymbol}/refuel`, requestPayload);
};

const sellCargo = (shipSymbol: string, symbol: string, units: number) => {
    const payload: SellPayload = { symbol, units };
    return axiosManager.post(`/my/ships/${shipSymbol}/sell`, payload);
};

export {
    dockShip,
    extractResources,
    navigateShip,
    orbitShip,
    refuelShip,
    sellCargo,
};
