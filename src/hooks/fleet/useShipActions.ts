import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
    dockShip,
    extractResources,
    navigateShip,
    orbitShip,
    refuelShip,
    sellCargo,
} from "services/shipActions";

const useShipActions = (shipSymbol?: string) => {
    const queryClient = useQueryClient();

    const invalidateShip = () => {
        if (!shipSymbol) {
            return;
        }

        queryClient.invalidateQueries({ queryKey: ["ship", shipSymbol] });
        queryClient.invalidateQueries({ queryKey: ["ships"] });
    };

    const orbitMutation = useMutation({
        mutationFn: async () => {
            if (!shipSymbol) {
                throw new Error("Ship symbol required");
            }

            return orbitShip(shipSymbol);
        },
        onSuccess: invalidateShip,
    });

    const dockMutation = useMutation({
        mutationFn: async () => {
            if (!shipSymbol) {
                throw new Error("Ship symbol required");
            }

            return dockShip(shipSymbol);
        },
        onSuccess: invalidateShip,
    });

    const navigateMutation = useMutation({
        mutationFn: async (waypointSymbol: string) => {
            if (!shipSymbol) {
                throw new Error("Ship symbol required");
            }

            return navigateShip(shipSymbol, waypointSymbol);
        },
        onSuccess: invalidateShip,
    });

    const extractMutation = useMutation({
        mutationFn: async () => {
            if (!shipSymbol) {
                throw new Error("Ship symbol required");
            }

            return extractResources(shipSymbol);
        },
        onSuccess: invalidateShip,
    });

    const refuelMutation = useMutation({
        mutationFn: async (fromCargo?: boolean) => {
            if (!shipSymbol) {
                throw new Error("Ship symbol required");
            }

            return refuelShip(shipSymbol, { fromCargo });
        },
        onSuccess: invalidateShip,
    });

    const sellMutation = useMutation({
        mutationFn: async ({
            symbol,
            units,
        }: {
            symbol: string;
            units: number;
        }) => {
            if (!shipSymbol) {
                throw new Error("Ship symbol required");
            }

            return sellCargo(shipSymbol, symbol, units);
        },
        onSuccess: invalidateShip,
    });

    const isWorking =
        orbitMutation.isPending ||
        dockMutation.isPending ||
        navigateMutation.isPending ||
        extractMutation.isPending ||
        refuelMutation.isPending ||
        sellMutation.isPending;

    return {
        orbit: orbitMutation.mutateAsync,
        dock: dockMutation.mutateAsync,
        navigate: navigateMutation.mutateAsync,
        extract: extractMutation.mutateAsync,
        refuel: refuelMutation.mutateAsync,
        sell: sellMutation.mutateAsync,
        isWorking,
        error:
            orbitMutation.error ||
            dockMutation.error ||
            navigateMutation.error ||
            extractMutation.error ||
            refuelMutation.error ||
            sellMutation.error,
    };
};

export default useShipActions;
