import { useSpaceTradersStore } from "../../store/spaceTradersStore";
import { useMemo } from "react";

export function useZustandShip(shipSymbol?: string) {
    const ships = useSpaceTradersStore((s) => s.ships);
    return useMemo(
        () => ships.find((s) => s.symbol === shipSymbol),
        [ships, shipSymbol],
    );
}
