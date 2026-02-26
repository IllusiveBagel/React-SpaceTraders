import axiosManager from "../../services/axiosManager";
import type { Survey } from "../../types/Survey";
import type { TradeSymbol } from "../../types/Common";

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
        cargoSymbol,
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
};
