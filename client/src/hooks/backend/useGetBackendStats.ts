import { useQuery } from "@tanstack/react-query";

import { isBackendConfigured } from "services/backendAxios";
import {
    getBackendStats,
    type GetBackendStatsResponse,
} from "services/backendMissionControl";

type UseGetBackendStatsOptions = {
    agentSymbol?: string;
    cycleId?: string;
};

const useGetBackendStats = ({
    agentSymbol,
    cycleId,
}: UseGetBackendStatsOptions) => {
    const normalizedSymbol = agentSymbol?.trim().toUpperCase();

    return useQuery<GetBackendStatsResponse>({
        queryKey: ["backend", "stats", normalizedSymbol, cycleId],
        queryFn: async () => {
            if (!normalizedSymbol) {
                throw new Error("Agent symbol is required.");
            }

            return getBackendStats(normalizedSymbol, cycleId);
        },
        enabled: isBackendConfigured && Boolean(normalizedSymbol),
        staleTime: 15_000,
    });
};

export default useGetBackendStats;
