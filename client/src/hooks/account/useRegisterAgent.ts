import { useMutation } from "@tanstack/react-query";

import { registerAgent } from "services/accountActions";
import type { Agent } from "types/agent";

type RegisterAgentPayload = {
    symbol: string;
    faction: string;
};

type RegisterAgentResponse = {
    token: string;
    agent: Agent;
};

const useRegisterAgent = () => {
    return useMutation<RegisterAgentResponse, Error, RegisterAgentPayload>({
        mutationFn: async (payload) => {
            const response = await registerAgent(payload);
            return response.data.data as RegisterAgentResponse;
        },
    });
};

export default useRegisterAgent;
