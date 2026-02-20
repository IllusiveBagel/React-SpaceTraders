import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import axiosManager from "services/axiosManager";
import type { Shipyard } from "types/shipyard";

const useGetShipyard = (systemSymbol?: string, waypointSymbol?: string) => {
    return useQuery<Shipyard | null>({
        queryKey: ["shipyard", systemSymbol, waypointSymbol],
        enabled: Boolean(systemSymbol && waypointSymbol),
        refetchInterval: 5000,
        refetchIntervalInBackground: true,
        queryFn: async () => {
            try {
                const response = await axiosManager.get(
                    `/systems/${systemSymbol}/waypoints/${waypointSymbol}/shipyard`,
                );
                return response.data.data as Shipyard;
            } catch (error) {
                if (
                    axios.isAxiosError(error) &&
                    error.response?.status === 404
                ) {
                    return null;
                }

                throw error;
            }
        },
    });
};

export default useGetShipyard;
