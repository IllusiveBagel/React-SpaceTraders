import { useQuery } from "@tanstack/react-query";

import axiosManager from "services/axiosManager";
import type { Waypoint } from "types/waypoint";

const useGetWaypoint = (systemSymbol?: string, waypointSymbol?: string) => {
    return useQuery<Waypoint>({
        queryKey: ["waypoint", systemSymbol, waypointSymbol],
        enabled: Boolean(systemSymbol && waypointSymbol),
        queryFn: async () => {
            const response = await axiosManager.get(
                `/systems/${systemSymbol}/waypoints/${waypointSymbol}`,
            );
            return response.data.data as Waypoint;
        },
    });
};

export default useGetWaypoint;
