import { useQuery, useMutation } from "@tanstack/react-query";

import { getAccount, registerAgent } from "services/accountActions";
import type { Account } from "types/account";
import type { Agent } from "types/agent";

type RegisterAgentPayload = {
    symbol: string;
    faction: string;
};

type RegisterAgentResponse = {
    token: string;
    agent: Agent;
};

const useGetAccount = () => {
    return useQuery<Account>({
        queryKey: ["account"],
        queryFn: async () => {
            const response = await getAccount();
            return response.data.data as Account;
        },
    });
};

const useRegisterAgent = () => {
    return useMutation<RegisterAgentResponse, Error, RegisterAgentPayload>({
        mutationFn: async (payload) => {
            const response = await registerAgent(payload);
            return response.data.data as RegisterAgentResponse;
        },
    });
};

export { useGetAccount, useRegisterAgent };
