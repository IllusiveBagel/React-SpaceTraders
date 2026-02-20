import axiosManager from "services/axiosManager";
import { useQuery } from "@tanstack/react-query";

import type { Ship } from "types/fleet";

const useGetShips = () => {
    return useQuery<Ship[]>({
        queryKey: ["ships"],
        refetchInterval: 5000,
        refetchIntervalInBackground: true,
        queryFn: async () => {
            const response = await axiosManager.get("/my/ships");
            return response.data.data as Ship[];
        },
    });
};

export default useGetShips;
