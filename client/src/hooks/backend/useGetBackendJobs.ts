import { useQuery } from "@tanstack/react-query";

import { isBackendConfigured } from "services/backendAxios";
import { listBackendJobs, type BackendJob } from "services/backendJobs";

const useGetBackendJobs = (agentSymbol?: string) => {
    const normalizedSymbol = agentSymbol?.trim().toUpperCase();

    return useQuery<BackendJob[]>({
        queryKey: ["backend", "jobs", normalizedSymbol],
        queryFn: () => listBackendJobs(normalizedSymbol),
        enabled: isBackendConfigured && Boolean(normalizedSymbol),
        staleTime: 10_000,
    });
};

export default useGetBackendJobs;
