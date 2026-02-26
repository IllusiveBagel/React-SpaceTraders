import axiosManager from "services/axiosManager";

const getShips = () => {
    return axiosManager.get("/my/ships");
};

const getShip = (shipSymbol: string) => {
    return axiosManager.get(`/my/ships/${shipSymbol}`);
};

const getShipCargo = (shipSymbol: string) => {
    return axiosManager.get(`/my/ships/${shipSymbol}/cargo`);
};

const getShipModules = (shipSymbol: string) => {
    return axiosManager.get(`/my/ships/${shipSymbol}/modules`);
};

const getShipMounts = (shipSymbol: string) => {
    return axiosManager.get(`/my/ships/${shipSymbol}/mounts`);
};

const getShipNav = (shipSymbol: string) => {
    return axiosManager.get(`/my/ships/${shipSymbol}/nav`);
};

const getShipCooldown = (shipSymbol: string) => {
    return axiosManager.get(`/my/ships/${shipSymbol}/cooldown`);
};

const getScrapShip = (shipSymbol: string) => {
    return axiosManager.post(`/my/ships/${shipSymbol}/scrap`);
};

const getRepairShip = (shipSymbol: string) => {
    return axiosManager.post(`/my/ships/${shipSymbol}/repair`);
};

export {
    getShips,
    getShip,
    getShipCargo,
    getShipModules,
    getShipMounts,
    getShipNav,
    getShipCooldown,
    getScrapShip,
    getRepairShip,
};
