import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
    setBackendJobState,
    type BackendJob,
    type BackendRun,
    type JobStateAction,
} from "services/backendJobs";

type SetBackendJobStatePayload = {
    jobId: string;
    action: JobStateAction;
};

type SetBackendJobStateResult = {
    job: BackendJob;
    run: BackendRun | null;
};

const useSetBackendJobState = () => {
    const queryClient = useQueryClient();

    return useMutation<
        SetBackendJobStateResult,
        Error,
        SetBackendJobStatePayload
    >({
        mutationFn: ({ jobId, action }) => setBackendJobState(jobId, action),
        onSuccess: ({ job }) => {
            queryClient.invalidateQueries({
                queryKey: ["backend", "jobs", job.agentSymbol],
            });
        },
    });
};

export default useSetBackendJobState;
