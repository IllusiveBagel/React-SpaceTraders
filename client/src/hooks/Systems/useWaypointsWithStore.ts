import { useQuerySystems } from "./";

const useWaypointsWithStore = (systemSymbol?: string) => {
    const { useListWaypointsInSystem } = useQuerySystems(systemSymbol);
    const listWaypointsQuery = useListWaypointsInSystem(
        { page: 1, limit: 20 },
        { fetchAll: true },
    );
    const waypoints = listWaypointsQuery.data ?? [];

    return {
        waypoints,
        isLoading:
            !!systemSymbol &&
            listWaypointsQuery.isLoading &&
            waypoints.length === 0,
        error: systemSymbol ? listWaypointsQuery.error : undefined,
    };
};

export default useWaypointsWithStore;
