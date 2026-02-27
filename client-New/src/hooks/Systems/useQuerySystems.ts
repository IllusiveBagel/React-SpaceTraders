import { useQuery } from "@tanstack/react-query";
import { listWaypointsInSystem } from "services/Systems/systemsQueryService";
import { useSpaceTradersStore } from "store/spaceTradersStore";
import type { Waypoint } from "types/Waypoint";

const fetchOptions = {
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
};

const useQuerySystems = (systemSymbol?: string) => {
    const setWaypoints = useSpaceTradersStore((state) => state.setWaypoints);

    const useListWaypointsInSystem = () => {
        return useQuery<Waypoint[]>({
            queryKey: ["systems", systemSymbol, "waypoints"],
            queryFn: async () => {
                if (!systemSymbol) {
                    throw new Error("System symbol is required");
                }
                const response = await listWaypointsInSystem(systemSymbol);
                setWaypoints(response.data.data as Waypoint[]);
                return response.data.data;
            },
            enabled: !!systemSymbol,
            ...fetchOptions,
        });
    };

    return { useListWaypointsInSystem };
};

export default useQuerySystems;
