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

const useQueryShip = (shipSymbol: string) => {
    const shipsQuery = useQuery<Ship[]>({
        queryKey: ["ships"],
        queryFn: async () => {
            const response = await getShips();
            return response.data.data as Ship[];
        },
    });

    const shipQuery = useQuery<Ship>({
        queryKey: ["ship", shipSymbol],
        queryFn: async () => {
            const response = await getShip(shipSymbol);
            const ship = response.data.data as Ship;
            if (!ship) {
                throw new Error("Ship not found");
            }
            return ship;
        },
        enabled: !!shipSymbol,
    });

    const shipCargoQuery = useQuery<ShipCargo>({
        queryKey: ["shipCargo", shipSymbol],
        queryFn: async () => {
            const response = await getShipCargo(shipSymbol);
            return response.data.data as ShipCargo;
        },
        enabled: !!shipSymbol,
    });

    const shipModulesQuery = useQuery<ShipModule[]>({
        queryKey: ["shipModules", shipSymbol],
        queryFn: async () => {
            const response = await getShipModules(shipSymbol);
            return response.data.data as ShipModule[];
        },
        enabled: !!shipSymbol,
    });

    const shipMountsQuery = useQuery<ShipMount[]>({
        queryKey: ["shipMounts", shipSymbol],
        queryFn: async () => {
            const response = await getShipMounts(shipSymbol);
            return response.data.data as ShipMount[];
        },
        enabled: !!shipSymbol,
    });

    const shipNavQuery = useQuery<ShipNav>({
        queryKey: ["shipNav", shipSymbol],
        queryFn: async () => {
            const response = await getShipNav(shipSymbol);
            return response.data.data as ShipNav;
        },
        enabled: !!shipSymbol,
    });

    const shipCooldownQuery = useQuery<Cooldown>({
        queryKey: ["shipCooldown", shipSymbol],
        queryFn: async () => {
            const response = await getShipCooldown(shipSymbol);
            return response.data.data as Cooldown;
        },
        enabled: !!shipSymbol,
    });

    const scrapShipQuery = useQuery<Transaction>({
        queryKey: ["scrapShip", shipSymbol],
        queryFn: async () => {
            const response = await getScrapShip(shipSymbol);
            return response.data.data as Transaction;
        },
        enabled: !!shipSymbol,
    });

    const repairShipQuery = useQuery<Transaction>({
        queryKey: ["repairShip", shipSymbol],
        queryFn: async () => {
            const response = await getRepairShip(shipSymbol);
            return response.data.data as Transaction;
        },
        enabled: !!shipSymbol,
    });

    return {
        ships: shipsQuery,
        ship: shipQuery,
        shipCargo: shipCargoQuery,
        shipModules: shipModulesQuery,
        shipMounts: shipMountsQuery,
        shipNav: shipNavQuery,
        shipCooldown: shipCooldownQuery,
        scrapShip: scrapShipQuery,
        repairShip: repairShipQuery,
    };
};

export default useQueryShip;
