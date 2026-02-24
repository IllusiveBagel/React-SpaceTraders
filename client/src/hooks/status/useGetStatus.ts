import { useQuery } from "@tanstack/react-query";

import axiosManager from "services/axiosManager";
import type { ServerStatus } from "types/status";

const useGetStatus = () => {
    return useQuery<ServerStatus>({
        queryKey: ["serverStatus"],
        refetchInterval: 60000,
        refetchIntervalInBackground: true,
        queryFn: async () => {
            const response = await axiosManager.get("/");
            return response.data as ServerStatus;
        },
    });
};

export default useGetStatus;
