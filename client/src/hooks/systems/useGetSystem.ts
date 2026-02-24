import axiosManager from "services/axiosManager";
import { useQuery } from "@tanstack/react-query";
import type { System } from "types/system";

const useGetSystem = (systemSymbol?: string) => {
    return useQuery<System>({
        queryKey: ["system", systemSymbol],
        enabled: Boolean(systemSymbol),
        queryFn: async () => {
            const response = await axiosManager.get(`/systems/${systemSymbol}`);
            return response.data.data as System;
        },
    });
};

export default useGetSystem;
