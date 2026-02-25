import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
    dockShip,
    createSurvey,
    extractResources,
    extractWithSurvey,
    jettisonCargo,
    navigateShip,
    orbitShip,
    refuelShip,
    setFlightMode,
    sellCargo,
} from "services/shipActions";
import type { Survey } from "types/survey";

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

    const createSurveyMutation = useMutation({
        mutationFn: async () => {
            if (!shipSymbol) {
                throw new Error("Ship symbol required");
            }
            return (await createSurvey(shipSymbol)).data.data.surveys;
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

    const extractWithSurveyMutation = useMutation({
        mutationFn: async (survey: Survey | null) => {
            if (!shipSymbol || !survey) {
                throw new Error("Ship symbol and survey required");
            }

            return extractWithSurvey(shipSymbol, survey);
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

    const flightModeMutation = useMutation({
        mutationFn: async (flightMode: string) => {
            if (!shipSymbol) {
                throw new Error("Ship symbol required");
            }

            return setFlightMode(shipSymbol, flightMode);
        },
        onSuccess: invalidateShip,
    });

    const jettisonMutation = useMutation({
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

            return jettisonCargo(shipSymbol, symbol, units);
        },
        onSuccess: invalidateShip,
    });

    const isWorking =
        orbitMutation.isPending ||
        dockMutation.isPending ||
        navigateMutation.isPending ||
        createSurveyMutation.isPending ||
        extractMutation.isPending ||
        extractWithSurveyMutation.isPending ||
        refuelMutation.isPending ||
        sellMutation.isPending ||
        flightModeMutation.isPending ||
        jettisonMutation.isPending;

    return {
        orbit: orbitMutation.mutateAsync,
        dock: dockMutation.mutateAsync,
        navigate: navigateMutation.mutateAsync,
        createSurvey: createSurveyMutation.mutateAsync,
        extract: extractMutation.mutateAsync,
        extractWithSurvey: extractWithSurveyMutation.mutateAsync,
        refuel: refuelMutation.mutateAsync,
        setFlightMode: flightModeMutation.mutateAsync,
        sell: sellMutation.mutateAsync,
        jettison: jettisonMutation.mutateAsync,
        isWorking,
        error:
            orbitMutation.error ||
            dockMutation.error ||
            navigateMutation.error ||
            createSurveyMutation.error ||
            extractMutation.error ||
            extractWithSurveyMutation.error ||
            refuelMutation.error ||
            sellMutation.error ||
            flightModeMutation.error ||
            jettisonMutation.error,
    };
};

export default useShipActions;
