import backendAxios, { isBackendConfigured } from "services/backendAxios";

type StoredAgent = {
    symbol: string;
    faction?: string;
    hasToken: boolean;
    updatedAt?: string;
};

type AgentStoreResponse<T> = {
    data: T;
};

type ListStoredAgentsResponse = {
    agents: StoredAgent[];
};

type ConnectStoredAgentResponse = {
    token: string;
    symbol: string;
};

const listStoredAgents = async () => {
    if (!isBackendConfigured) {
        return [] as StoredAgent[];
    }

    const response =
        await backendAxios.get<AgentStoreResponse<ListStoredAgentsResponse>>(
            "/agents",
        );

    return response.data.data.agents;
};

const storeAgentToken = async (token: string) => {
    if (!isBackendConfigured) {
        return;
    }

    await backendAxios.post("/agents", { token });
};

const connectStoredAgent = async (symbol: string) => {
    if (!isBackendConfigured) {
        throw new Error("Backend agent store is not configured.");
    }

    const response = await backendAxios.post<
        AgentStoreResponse<ConnectStoredAgentResponse>
    >("/agents/select", { symbol });

    return response.data.data;
};

export type { StoredAgent };
export { connectStoredAgent, listStoredAgents, storeAgentToken };
