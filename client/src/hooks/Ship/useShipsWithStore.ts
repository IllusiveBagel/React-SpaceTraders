import { useEffect } from "react";
import { useSpaceTradersStore } from "../../store/spaceTradersStore";
import { useQueryShip } from "./";

const useShipsWithStore = () => {
    const ships = useSpaceTradersStore((state) => state.ships);
    const setShips = useSpaceTradersStore((state) => state.setShips);
    const { useShipsQuery } = useQueryShip();
    const getShips = useShipsQuery();

    // If Zustand ships are empty, fetch from API and update Zustand
    useEffect(() => {
        if (
            (!ships || ships.length === 0) &&
            getShips.data &&
            !getShips.isFetching
        ) {
            setShips(getShips.data);
        }
    }, [ships, getShips.data, getShips.isFetching, setShips]);

    // Only trigger fetch if Zustand is empty and React Query has not fetched yet
    useEffect(() => {
        if (
            (!ships || ships.length === 0) &&
            !getShips.data &&
            !getShips.isFetching &&
            !getShips.isLoading
        ) {
            getShips.refetch();
        }
    }, [ships, getShips.refetch]);

    return {
        ships,
        isLoading: getShips.isLoading && (!ships || ships.length === 0),
        error: getShips.error,
    };
};

export default useShipsWithStore;
