import axiosManager from "services/axiosManager";
import type { Meta } from "types/Common/Meta";

const listSystems = ({ page = 1, limit = 20 }: Meta = {} as Meta) => {
    return axiosManager.get("/systems", {
        meta: { page, limit },
    });
};

const getSystem = (systemSymbol: string) => {
    return axiosManager.get(`/systems/${systemSymbol}`);
};

const listWaypointsInSystem = (
    systemSymbol: string,
    { page = 1, limit = 20 }: Meta = {} as Meta,
) => {
    return axiosManager.get(`/systems/${systemSymbol}/waypoints`, {
        meta: { page, limit },
    });
};

export { listSystems, getSystem, listWaypointsInSystem };
