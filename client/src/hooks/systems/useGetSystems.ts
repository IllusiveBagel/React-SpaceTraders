import axiosManager from "services/axiosManager";
import { useQuery } from "@tanstack/react-query";
import type { System } from "types/system";

type SystemsMeta = {
    total: number;
    page: number;
    limit: number;
};

type SystemsResponse = {
    data: System[];
    meta: SystemsMeta;
};

type UseGetSystemsOptions = {
    page?: number;
    limit?: number;
};

const useGetSystems = ({ page = 1, limit = 20 }: UseGetSystemsOptions = {}) => {
    return useQuery<SystemsResponse>({
        queryKey: ["systems", page, limit],
        queryFn: async () => {
            const response = await axiosManager.get("/systems", {
                params: { page, limit },
            });
            return response.data as SystemsResponse;
        },
    });
};

export default useGetSystems;
