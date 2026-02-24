import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
    upsertBackendJob,
    type BackendJob,
    type UpsertBackendJobPayload,
} from "services/backendJobs";

const useUpsertBackendJob = () => {
    const queryClient = useQueryClient();

    return useMutation<BackendJob, Error, UpsertBackendJobPayload>({
        mutationFn: upsertBackendJob,
        onSuccess: (job) => {
            queryClient.invalidateQueries({
                queryKey: ["backend", "jobs", job.agentSymbol],
            });
        },
    });
};

export default useUpsertBackendJob;
