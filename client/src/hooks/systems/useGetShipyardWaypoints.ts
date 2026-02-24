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

const SHIPYARD_TRAITS = ["SHIPYARD"];
const PAGE_LIMIT = 20;

const fetchWaypointsByTrait = async (
    systemSymbol: string,
    trait: string,
): Promise<Waypoint[]> => {
    const results: Waypoint[] = [];
    let page = 1;

    while (true) {
        const response = await axiosManager.get(
            `/systems/${systemSymbol}/waypoints`,
            {
                params: {
                    trait,
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

const useGetShipyardWaypoints = (systemSymbol?: string) => {
    return useQuery<Waypoint[]>({
        queryKey: ["shipyard-waypoints", systemSymbol],
        enabled: Boolean(systemSymbol),
        queryFn: async () => {
            if (!systemSymbol) {
                return [] as Waypoint[];
            }

            const lists = await Promise.all(
                SHIPYARD_TRAITS.map((trait) =>
                    fetchWaypointsByTrait(systemSymbol, trait),
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
export default useGetShipyardWaypoints;
