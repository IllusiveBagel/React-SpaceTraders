import { useQuery } from "@tanstack/react-query";
import { getAgent } from "services/Agent/agentQueryService";
import type { Agent } from "types/Agent";

const useQueryAgent = () => {
    const agentQuery = useQuery<Agent>({
        queryKey: ["agent"],
        queryFn: async () => {
            const response = await getAgent();
            return response.data.data as Agent;
        },
    });

    return {
        getAgent: agentQuery,
    };
};

export default useQueryAgent;
