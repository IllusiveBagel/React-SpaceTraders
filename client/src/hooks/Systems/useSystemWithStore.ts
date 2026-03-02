import { useEffect } from "react";
import { useSpaceTradersStore } from "../../store/spaceTradersStore";
import { useQuerySystems } from "./";

const useSystemWithStore = (systemSymbol: string) => {
    const system = useSpaceTradersStore((state) => state.system);
    const setSystem = useSpaceTradersStore((state) => state.setSystem);
    const { useGetSystem } = useQuerySystems(systemSymbol);
    const getSystem = useGetSystem();

    // If Zustand waypoints are empty, fetch from API and update Zustand
    useEffect(() => {
        if (
            (!system || Object.keys(system).length === 0) &&
            getSystem.data &&
            !getSystem.isFetching
        ) {
            setSystem(getSystem.data);
        }
    }, [system, getSystem.data, getSystem.isFetching, setSystem]);

    // Only trigger fetch if Zustand is empty and React Query has not fetched yet
    useEffect(() => {
        if (
            (!system || Object.keys(system).length === 0) &&
            !getSystem.data &&
            !getSystem.isFetching &&
            !getSystem.isLoading
        ) {
            getSystem.refetch();
        }
    }, [system, getSystem.refetch]);

    return {
        system,
        isLoading:
            getSystem.isLoading &&
            (!system || Object.keys(system).length === 0),
        error: getSystem.error,
    };
};

export default useSystemWithStore;
