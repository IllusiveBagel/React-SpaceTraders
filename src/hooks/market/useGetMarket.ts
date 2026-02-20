import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import axiosManager from "services/axiosManager";
import type { Market } from "types/market";

const useGetMarket = (systemSymbol?: string, waypointSymbol?: string) => {
    return useQuery<Market | null>({
        queryKey: ["market", systemSymbol, waypointSymbol],
        enabled: Boolean(systemSymbol && waypointSymbol),
        refetchInterval: 5000,
        refetchIntervalInBackground: true,
        queryFn: async () => {
            try {
                const response = await axiosManager.get(
                    `/systems/${systemSymbol}/waypoints/${waypointSymbol}/market`,
                );
                return response.data.data as Market;
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

export default useGetMarket;
