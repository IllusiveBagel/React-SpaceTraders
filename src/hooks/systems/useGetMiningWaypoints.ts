import { useQuery } from "@tanstack/react-query";

import axiosManager from "services/axiosManager";

type WaypointTrait = {
    symbol: string;
    name: string;
    description: string;
};

type Waypoint = {
    symbol: string;
    type: string;
    x: number;
    y: number;
    traits?: WaypointTrait[];
};

type WaypointsMeta = {
    total: number;
    page: number;
    limit: number;
};

type WaypointsResponse = {
    data: Waypoint[];
    meta: WaypointsMeta;
};

const MINING_TYPES = ["ASTEROID_FIELD", "ASTEROID", "ENGINEERED_ASTEROID"];
const PAGE_LIMIT = 20;

const fetchWaypointsByType = async (
    systemSymbol: string,
    type: string,
): Promise<Waypoint[]> => {
    const results: Waypoint[] = [];
    let page = 1;

    while (true) {
        const response = await axiosManager.get(
            `/systems/${systemSymbol}/waypoints`,
            {
                params: {
                    type,
                    page,
                    limit: PAGE_LIMIT,
                },
            },
        );

        const payload = response.data as WaypointsResponse;
        results.push(...payload.data);

        if (results.length >= payload.meta.total) {
            break;
        }

        page += 1;
    }

    return results;
};

const useGetMiningWaypoints = (systemSymbol?: string) => {
    return useQuery<Waypoint[]>({
        queryKey: ["mining-waypoints", systemSymbol],
        enabled: Boolean(systemSymbol),
        queryFn: async () => {
            if (!systemSymbol) {
                return [] as Waypoint[];
            }

            const lists = await Promise.all(
                MINING_TYPES.map((type) =>
                    fetchWaypointsByType(systemSymbol, type),
                ),
            );

            const unique = new Map<string, Waypoint>();
            lists.flat().forEach((waypoint) => {
                unique.set(waypoint.symbol, waypoint);
            });

            return Array.from(unique.values()).sort((a, b) =>
                a.symbol.localeCompare(b.symbol),
            );
        },
    });
};

export type { Waypoint, WaypointTrait };
export default useGetMiningWaypoints;
