import { useSpaceTradersStore } from "../../store/spaceTradersStore";
import { useEffect } from "react";
import axiosManager from "../../services/axiosManager";
import type { Ship } from "../../types/fleet";

// Zustand-powered hook to fetch and cache ships
export function useZustandShips() {
    const ships = useSpaceTradersStore((s) => s.ships);
    const setShips = useSpaceTradersStore((s) => s.setShips);

    useEffect(() => {
        let mounted = true;
        async function fetchShips() {
            const response = await axiosManager.get("/my/ships");
            if (mounted) setShips(response.data.data as Ship[]);
        }
        if (ships.length === 0) fetchShips();
        // Optionally, add polling or refetch logic here
        return () => {
            mounted = false;
        };
    }, [setShips, ships.length]);

    return ships;
}
