import { useEffect } from "react";
import { useSpaceTradersStore } from "../../store/spaceTradersStore";
import { useQuerySystems } from "./";

const useWaypointsWithStore = (systemSymbol: string) => {
    const waypoints = useSpaceTradersStore((state) => state.waypoints);
    const setWaypoints = useSpaceTradersStore((state) => state.setWaypoints);
    const { useListWaypointsInSystem } = useQuerySystems(systemSymbol);
    const getWaypoints = useListWaypointsInSystem();

    // If Zustand waypoints are empty, fetch from API and update Zustand
    useEffect(() => {
        if (
            (!waypoints || waypoints.length === 0) &&
            getWaypoints.data &&
            !getWaypoints.isFetching
        ) {
            setWaypoints(getWaypoints.data);
        }
    }, [waypoints, getWaypoints.data, getWaypoints.isFetching, setWaypoints]);

    // Only trigger fetch if Zustand is empty and React Query has not fetched yet
    useEffect(() => {
        if (
            (!waypoints || waypoints.length === 0) &&
            !getWaypoints.data &&
            !getWaypoints.isFetching &&
            !getWaypoints.isLoading
        ) {
            getWaypoints.refetch();
        }
    }, [waypoints, getWaypoints.refetch]);

    return {
        waypoints,
        isLoading:
            getWaypoints.isLoading && (!waypoints || waypoints.length === 0),
        error: getWaypoints.error,
    };
};

export default useWaypointsWithStore;
