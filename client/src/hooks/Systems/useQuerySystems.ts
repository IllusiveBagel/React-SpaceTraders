import { useQuery } from "@tanstack/react-query";
import {
    getSystem,
    listSystems,
    listWaypointsInSystem,
} from "services/Systems/systemsQueryService";
import { useSpaceTradersStore } from "store/spaceTradersStore";
import type { Meta } from "types/Common/Meta";
import type { Waypoint } from "types/Waypoint";

const fetchOptions = {
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
};

const useQuerySystems = (systemSymbol?: string) => {
    const setSystem = useSpaceTradersStore((state) => state.setSystem);

    const useListSystems = ({ page = 1, limit = 20 }: Meta = {} as Meta) => {
        return useQuery({
            queryKey: ["systems", page, limit],
            queryFn: async () => {
                const response = await listSystems({ page, limit });
                return response.data.data;
            },
            ...fetchOptions,
        });
    };

    const useGetSystem = () => {
        return useQuery({
            queryKey: ["systems", systemSymbol],
            queryFn: async () => {
                if (!systemSymbol) {
                    throw new Error("System symbol is required");
                }
                const response = await getSystem(systemSymbol);
                setSystem(response.data.data);
                return response.data.data;
            },
            enabled: !!systemSymbol,
            ...fetchOptions,
        });
    };

    const useListWaypointsInSystem = (
        { page = 1, limit = 20 }: Meta = {} as Meta,
        options?: { fetchAll?: boolean },
    ) => {
        const fetchAll = options?.fetchAll ?? false;

        return useQuery<Waypoint[]>({
            queryKey: [
                "systems",
                systemSymbol,
                "waypoints",
                page,
                limit,
                fetchAll,
            ],
            queryFn: async () => {
                if (!systemSymbol) {
                    throw new Error("System symbol is required");
                }

                const firstResponse = await listWaypointsInSystem(
                    systemSymbol,
                    { page, limit },
                );
                const firstData = firstResponse.data.data as Waypoint[];
                const total =
                    (firstResponse.data?.meta?.total as number | undefined) ??
                    undefined;

                if (!fetchAll || !total || total <= firstData.length) {
                    return firstData;
                }

                const totalPages = Math.ceil(total / limit);
                const allWaypoints = [...firstData];

                for (
                    let currentPage = page + 1;
                    currentPage <= totalPages;
                    currentPage += 1
                ) {
                    const response = await listWaypointsInSystem(systemSymbol, {
                        page: currentPage,
                        limit,
                    });
                    allWaypoints.push(...(response.data.data as Waypoint[]));
                }

                return allWaypoints;
            },
            enabled: !!systemSymbol,
            ...fetchOptions,
        });
    };

    return { useListSystems, useGetSystem, useListWaypointsInSystem };
};

export default useQuerySystems;
