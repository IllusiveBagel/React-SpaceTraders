import axiosManager from "services/axiosManager";
import { useQuery } from "@tanstack/react-query";

import type { Contract } from "types/contract";

const useGetContracts = () => {
    return useQuery<Contract[]>({
        queryKey: ["contracts"],
        queryFn: async () => {
            const response = await axiosManager.get("/my/contracts");
            return response.data.data as Contract[];
        },
    });
};

export default useGetContracts;
