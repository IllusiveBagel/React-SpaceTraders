import backendAxios, { isBackendConfigured } from "services/backendAxios";

type BackendEnvelope<T> = {
    data: T;
};

type BackendCycle = {
    id: string;
    startedAt: string;
    endedAt: string | null;
    reason?: string;
};

type BackendStatsSnapshot = {
    timestamp: string;
    credits?: number;
    shipCount?: number;
    contractsOpen?: number;
    contractsFulfilled?: number;
    custom?: Record<string, unknown>;
};

type BackendStatsPayload = {
    credits?: number;
    shipCount?: number;
    contractsOpen?: number;
    contractsFulfilled?: number;
    custom?: Record<string, unknown>;
};

type GetBackendStatsResponse = {
    agentSymbol: string;
    cycleId: string;
    snapshots: BackendStatsSnapshot[];
};

type ResetBackendCycleResponse = {
    activeCycle: BackendCycle;
    reason: string;
};

const assertBackendConfigured = () => {
    if (!isBackendConfigured) {
        throw new Error("Backend is not configured.");
    }
};

const getCurrentBackendCycle = async () => {
    assertBackendConfigured();

    const response =
        await backendAxios.get<BackendEnvelope<BackendCycle>>(
            "/cycles/current",
        );

    return response.data.data;
};

const resetBackendCycle = async (reason = "manual") => {
    assertBackendConfigured();

    const response = await backendAxios.post<
        BackendEnvelope<ResetBackendCycleResponse>
    >("/cycles/reset", { reason });

    return response.data.data;
};

const getBackendStats = async (agentSymbol: string, cycleId?: string) => {
    assertBackendConfigured();

    const normalizedSymbol = agentSymbol.trim().toUpperCase();
    const response = await backendAxios.get<
        BackendEnvelope<GetBackendStatsResponse>
    >(`/stats/${normalizedSymbol}`, {
        params: cycleId ? { cycleId } : undefined,
    });

    return response.data.data;
};

const appendBackendStatsSnapshot = async (
    agentSymbol: string,
    payload: BackendStatsPayload,
) => {
    assertBackendConfigured();

    const normalizedSymbol = agentSymbol.trim().toUpperCase();
    await backendAxios.post(`/stats/${normalizedSymbol}/snapshots`, payload);
};

export type {
    BackendCycle,
    BackendStatsPayload,
    BackendStatsSnapshot,
    GetBackendStatsResponse,
};
export {
    appendBackendStatsSnapshot,
    getBackendStats,
    getCurrentBackendCycle,
    resetBackendCycle,
};
