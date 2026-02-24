import { useQuery } from "@tanstack/react-query";

import { isBackendConfigured } from "services/backendAxios";
import {
    getCurrentBackendCycle,
    type BackendCycle,
} from "services/backendMissionControl";

const useGetBackendCycle = () => {
    return useQuery<BackendCycle>({
        queryKey: ["backend", "cycle", "current"],
        queryFn: getCurrentBackendCycle,
        enabled: isBackendConfigured,
        staleTime: 15_000,
    });
};

export default useGetBackendCycle;
