import backendAxios, { isBackendConfigured } from "services/backendAxios";

type BackendEnvelope<T> = {
    data: T;
};

type BackendJobRunState = "running" | "paused" | "stopped";

type BackendJob = {
    id: string;
    agentSymbol: string;
    shipSymbol: string;
    mode: string;
    templateId?: string;
    config?: Record<string, unknown>;
    runState: BackendJobRunState;
    lastRunId?: string | null;
    createdAt: string;
    updatedAt: string;
};

type BackendRunStatus = "running" | "paused" | "stopped";

type BackendRun = {
    id: string;
    jobId: string;
    status: BackendRunStatus;
    startedAt: string;
    endedAt: string | null;
    updatedAt: string;
};

type BackendRunLog = {
    id: string;
    runId: string;
    timestamp: string;
    type: "system" | "action" | "error";
    message: string;
};

type UpsertBackendJobPayload = {
    agentSymbol: string;
    shipSymbol: string;
    mode: string;
    templateId?: string;
    config?: Record<string, unknown>;
};

type JobStateAction = "start" | "pause" | "stop";

const assertBackendConfigured = () => {
    if (!isBackendConfigured) {
        throw new Error("Backend is not configured.");
    }
};

const listBackendJobs = async (agentSymbol?: string) => {
    assertBackendConfigured();

    const normalizedSymbol = agentSymbol?.trim().toUpperCase();
    const response = await backendAxios.get<
        BackendEnvelope<{ jobs: BackendJob[] }>
    >("/jobs", {
        params: normalizedSymbol
            ? { agentSymbol: normalizedSymbol }
            : undefined,
    });

    return response.data.data.jobs;
};

const upsertBackendJob = async (payload: UpsertBackendJobPayload) => {
    assertBackendConfigured();

    const response = await backendAxios.post<BackendEnvelope<BackendJob>>(
        "/jobs",
        {
            ...payload,
            agentSymbol: payload.agentSymbol.trim().toUpperCase(),
            shipSymbol: payload.shipSymbol.trim().toUpperCase(),
        },
    );

    return response.data.data;
};

const setBackendJobState = async (jobId: string, action: JobStateAction) => {
    assertBackendConfigured();

    const normalizedJobId = jobId.trim();
    const response = await backendAxios.post<
        BackendEnvelope<{ job: BackendJob; run: BackendRun | null }>
    >(`/jobs/${normalizedJobId}/${action}`);

    return response.data.data;
};

const getBackendRun = async (runId: string) => {
    assertBackendConfigured();

    const response = await backendAxios.get<BackendEnvelope<BackendRun>>(
        `/runs/${runId.trim()}`,
    );

    return response.data.data;
};

const getBackendRunLogs = async (runId: string) => {
    assertBackendConfigured();

    const response = await backendAxios.get<
        BackendEnvelope<{ runId: string; logs: BackendRunLog[] }>
    >(`/runs/${runId.trim()}/logs`);

    return response.data.data;
};

export type {
    BackendJob,
    BackendRun,
    BackendRunLog,
    BackendRunStatus,
    BackendJobRunState,
    JobStateAction,
    UpsertBackendJobPayload,
};
export {
    getBackendRun,
    getBackendRunLogs,
    listBackendJobs,
    setBackendJobState,
    upsertBackendJob,
};
