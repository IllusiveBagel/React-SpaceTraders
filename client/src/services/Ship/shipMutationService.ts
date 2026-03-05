import axiosManager from "../../services/axiosManager";
import type { Survey } from "../../types/Survey";
import type { Produce, TradeSymbol } from "../../types/Common";

const purchaseShip = (shipType: string, location: string) => {
    return axiosManager.post("/my/ships", {
        shipType,
        location,
    });
};

const createChart = (shipSymbol: string) => {
    return axiosManager.post(`/my/ships/${shipSymbol}/chart`);
};

const negotiateContract = (shipSymbol: string) => {
    return axiosManager.post(`/my/ships/${shipSymbol}/negotiate/contract`);
};

const dockShip = (shipSymbol: string) => {
    return axiosManager.post(`/my/ships/${shipSymbol}/dock`);
};

const extractResources = (shipSymbol: string) => {
    return axiosManager.post(`/my/ships/${shipSymbol}/extract`);
};

const extractResourcesWithSurvey = (shipSymbol: string, survey: Survey) => {
    return axiosManager.post(`/my/ships/${shipSymbol}/extract`, { survey });
};

const jettisonCargo = (
    shipSymbol: string,
    cargoSymbol: string,
    units: number,
) => {
    return axiosManager.post(`/my/ships/${shipSymbol}/jettison`, {
        symbol: cargoSymbol,
        units,
    });
};

const jumpShip = (shipSymbol: string, waypointSymbol: string) => {
    return axiosManager.post(`/my/ships/${shipSymbol}/jump`, {
        waypointSymbol,
    });
};

const scanSystems = (shipSymbol: string) => {
    return axiosManager.get(`/my/ships/${shipSymbol}/scan/systems`);
};

const scanWaypoints = (shipSymbol: string) => {
    return axiosManager.get(`/my/ships/${shipSymbol}/scan/waypoints`);
};

const scanShips = (shipSymbol: string) => {
    return axiosManager.get(`/my/ships/${shipSymbol}/scan/ships`);
};

const scrapShip = (shipSymbol: string) => {
    return axiosManager.post(`/my/ships/${shipSymbol}/scrap`);
};

const navigateShip = (shipSymbol: string, waypointSymbol: string) => {
    return axiosManager.post(`/my/ships/${shipSymbol}/navigate`, {
        waypointSymbol,
    });
};

const warpShip = (shipSymbol: string, waypointSymbol: string) => {
    return axiosManager.post(`/my/ships/${shipSymbol}/warp`, {
        waypointSymbol,
    });
};

const orbitShip = (shipSymbol: string) => {
    return axiosManager.post(`/my/ships/${shipSymbol}/orbit`);
};

const purchaseCargo = (
    shipSymbol: string,
    symbol: TradeSymbol,
    units: number,
) => {
    return axiosManager.post(`/my/ships/${shipSymbol}/purchase`, {
        symbol,
        units,
    });
};

const shipRefine = (shipSymbol: string, produceSymbol: Produce) => {
    return axiosManager.post(`/my/ships/${shipSymbol}/refine`, {
        produce: produceSymbol,
    });
};

const shipRefuel = (shipSymbol: string) => {
    return axiosManager.post(`/my/ships/${shipSymbol}/refuel`);
};

const sellCargo = (shipSymbol: string, symbol: TradeSymbol, units: number) => {
    return axiosManager.post(`/my/ships/${shipSymbol}/sell`, {
        symbol,
        units,
    });
};

const patchShipNav = (shipSymbol: string, flightMode: string) => {
    return axiosManager.patch(`/my/ships/${shipSymbol}/nav`, {
        flightMode,
    });
};

export {
    purchaseShip,
    createChart,
    negotiateContract,
    dockShip,
    extractResources,
    extractResourcesWithSurvey,
    jettisonCargo,
    jumpShip,
    scanSystems,
    scanWaypoints,
    scanShips,
    scrapShip,
    navigateShip,
    warpShip,
    orbitShip,
    purchaseCargo,
    shipRefine,
    shipRefuel,
    sellCargo,
    patchShipNav,
};
