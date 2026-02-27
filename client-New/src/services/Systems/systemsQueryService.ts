import axiosManager from "services/axiosManager";

const listWaypointsInSystem = (systemSymbol: string) => {
    return axiosManager.get(`/systems/${systemSymbol}/waypoints`);
};

export { listWaypointsInSystem };
