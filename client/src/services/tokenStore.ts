const AGENT_TOKEN_KEY = "spaceTraders:agentToken";

const getAgentToken = () => {
    if (typeof window === "undefined") return undefined;
    return localStorage.getItem(AGENT_TOKEN_KEY) ?? undefined;
};

const setAgentToken = (token: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(AGENT_TOKEN_KEY, token);
};

const clearAgentToken = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(AGENT_TOKEN_KEY);
};

const hasAgentToken = () => Boolean(getAgentToken());

export { clearAgentToken, getAgentToken, hasAgentToken, setAgentToken };
