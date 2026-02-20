import axiosManager from "services/axiosManager";
import { useQuery } from "@tanstack/react-query";

import type { Ship } from "types/fleet";

const useGetShip = (shipSymbol?: string) => {
    return useQuery<Ship>({
        queryKey: ["ship", shipSymbol],
        enabled: Boolean(shipSymbol),
        queryFn: async () => {
            const response = await axiosManager.get(`/my/ships/${shipSymbol}`);
            return response.data.data as Ship;
        },
    });
};

export default useGetShip;
