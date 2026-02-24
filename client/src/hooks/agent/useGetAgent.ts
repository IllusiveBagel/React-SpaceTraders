import axiosManager from "services/axiosManager";
import { useQuery } from "@tanstack/react-query";
import { type Agent } from "types/agent";

const useGetAgent = () => {
    return useQuery<Agent>({
        queryKey: ["agent"],
        queryFn: async () => {
            const response = await axiosManager.get("/my/agent");
            return response.data.data as Agent;
        },
    });
};

export default useGetAgent;
