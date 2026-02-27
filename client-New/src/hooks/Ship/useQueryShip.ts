import { useQuery } from "@tanstack/react-query";
import {
    getRepairShip,
    getScrapShip,
    getShip,
    getShipCargo,
    getShipCooldown,
    getShipModules,
    getShipMounts,
    getShipNav,
    getShips,
} from "../../services/Ship/shipQueryService";
import type {
    Ship,
    ShipCargo,
    ShipModule,
    ShipMount,
    ShipNav,
} from "../../types/Ship";
import type { Transaction } from "../../types/Common/Transaction";
import type { Cooldown } from "../../types/Cooldown/Cooldown";
import { useSpaceTradersStore } from "../../store/spaceTradersStore";

const fetchOptions = {
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
};

const useQueryShip = (shipSymbol?: string) => {
    const setShipCooldown = useSpaceTradersStore(
        (state) => state.setShipCooldown,
    );

    const useShipsQuery = () => {
        return useQuery<Ship[]>({
            queryKey: ["ships"],
            queryFn: async () => {
                const response = await getShips();
                return response.data.data as Ship[];
            },
            ...fetchOptions,
        });
    };

    const useShipQuery = () => {
        return useQuery<Ship>({
            queryKey: ["ship", shipSymbol],
            queryFn: async () => {
                if (!shipSymbol) {
                    throw new Error("Ship symbol is required");
                }
                const response = await getShip(shipSymbol);
                const ship = response.data.data as Ship;
                if (!ship) {
                    throw new Error("Ship not found");
                }
                return ship;
            },
            enabled: !!shipSymbol,
            ...fetchOptions,
        });
    };

    const useShipCargoQuery = () => {
        return useQuery<ShipCargo>({
            queryKey: ["shipCargo", shipSymbol],
            queryFn: async () => {
                if (!shipSymbol) {
                    throw new Error("Ship symbol is required");
                }
                const response = await getShipCargo(shipSymbol);
                return response.data.data as ShipCargo;
            },
            enabled: !!shipSymbol,
            ...fetchOptions,
        });
    };

    const useShipModulesQuery = () => {
        return useQuery<ShipModule[]>({
            queryKey: ["shipModules", shipSymbol],
            queryFn: async () => {
                if (!shipSymbol) {
                    throw new Error("Ship symbol is required");
                }
                const response = await getShipModules(shipSymbol);
                return response.data.data as ShipModule[];
            },
            enabled: !!shipSymbol,
            ...fetchOptions,
        });
    };

    const useShipMountsQuery = () => {
        return useQuery<ShipMount[]>({
            queryKey: ["shipMounts", shipSymbol],
            queryFn: async () => {
                if (!shipSymbol) {
                    throw new Error("Ship symbol is required");
                }
                const response = await getShipMounts(shipSymbol);
                return response.data.data as ShipMount[];
            },
            enabled: !!shipSymbol,
            ...fetchOptions,
        });
    };

    const useShipNavQuery = () => {
        return useQuery<ShipNav>({
            queryKey: ["shipNav", shipSymbol],
            queryFn: async () => {
                if (!shipSymbol) {
                    throw new Error("Ship symbol is required");
                }
                const response = await getShipNav(shipSymbol);
                return response.data.data as ShipNav;
            },
            enabled: !!shipSymbol,
            ...fetchOptions,
        });
    };

    const useShipCooldownQuery = () => {
        return useQuery<Cooldown>({
            queryKey: ["shipCooldown", shipSymbol],
            queryFn: async () => {
                if (!shipSymbol) {
                    throw new Error("Ship symbol is required");
                }
                const response = await getShipCooldown(shipSymbol);
                setShipCooldown(shipSymbol, response.data.data);
                return response.data.data as Cooldown;
            },
            enabled: !!shipSymbol,
            ...fetchOptions,
        });
    };

    const useScrapShipQuery = () => {
        return useQuery<Transaction>({
            queryKey: ["scrapShip", shipSymbol],
            queryFn: async () => {
                if (!shipSymbol) {
                    throw new Error("Ship symbol is required");
                }
                const response = await getScrapShip(shipSymbol);
                return response.data.data as Transaction;
            },
            ...fetchOptions,
        });
    };

    const useRepairShipQuery = () => {
        return useQuery<Transaction>({
            queryKey: ["repairShip", shipSymbol],
            queryFn: async () => {
                if (!shipSymbol) {
                    throw new Error("Ship symbol is required");
                }
                const response = await getRepairShip(shipSymbol);
                return response.data.data as Transaction;
            },
            enabled: false,
            ...fetchOptions,
        });
    };

    return {
        useShipsQuery,
        useShipQuery,
        useShipCargoQuery,
        useShipModulesQuery,
        useShipMountsQuery,
        useShipNavQuery,
        useShipCooldownQuery,
        useScrapShipQuery,
        useRepairShipQuery,
    };
};

export default useQueryShip;
