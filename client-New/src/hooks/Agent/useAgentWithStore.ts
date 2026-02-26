import { useEffect } from "react";
import { useSpaceTradersStore } from "../../store/spaceTradersStore";
import { useQueryAgent } from "./";

const useAgentWithStore = () => {
    const agent = useSpaceTradersStore((state) => state.agent);
    const setAgent = useSpaceTradersStore((state) => state.setAgent);
    const { getAgent } = useQueryAgent();

    // If Zustand agent is empty, fetch from API and update Zustand
    useEffect(() => {
        if (
            (!agent || Object.keys(agent).length === 0) &&
            getAgent.data &&
            !getAgent.isFetching
        ) {
            setAgent(getAgent.data);
        }
    }, [agent, getAgent.data, getAgent.isFetching, setAgent]);

    // Optionally, trigger fetch if agent is empty
    useEffect(() => {
        if (!agent || Object.keys(agent).length === 0) {
            getAgent.refetch();
        }
    }, [agent, getAgent.refetch]);

    return {
        agent,
        isLoading:
            getAgent.isLoading && (!agent || Object.keys(agent).length === 0),
        error: getAgent.error,
    };
};

export default useAgentWithStore;
