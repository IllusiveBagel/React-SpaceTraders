import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
    resetBackendCycle,
    type BackendCycle,
} from "services/backendMissionControl";

type ResetBackendCycleResult = {
    activeCycle: BackendCycle;
    reason: string;
};

const useResetBackendCycle = () => {
    const queryClient = useQueryClient();

    return useMutation<ResetBackendCycleResult, Error, string | undefined>({
        mutationFn: async (reason) => resetBackendCycle(reason ?? "manual"),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["backend", "cycle", "current"],
            });
            queryClient.invalidateQueries({
                queryKey: ["backend", "stats"],
            });
        },
    });
};

export default useResetBackendCycle;
