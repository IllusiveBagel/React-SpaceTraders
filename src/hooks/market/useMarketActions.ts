import { useMutation, useQueryClient } from "@tanstack/react-query";

import { purchaseCargo, sellCargo } from "services/marketActions";

const useMarketActions = (shipSymbol?: string) => {
    const queryClient = useQueryClient();

    const invalidateMarket = () => {
        if (shipSymbol) {
            queryClient.invalidateQueries({ queryKey: ["ship", shipSymbol] });
        }

        queryClient.invalidateQueries({ queryKey: ["ships"] });
        queryClient.invalidateQueries({ queryKey: ["agent"] });
        queryClient.invalidateQueries({ queryKey: ["market"] });
    };

    const purchaseMutation = useMutation({
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

            return purchaseCargo(shipSymbol, symbol, units);
        },
        onSuccess: invalidateMarket,
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
        onSuccess: invalidateMarket,
    });

    return {
        purchase: purchaseMutation.mutateAsync,
        sell: sellMutation.mutateAsync,
        isPurchasing: purchaseMutation.isPending,
        isSelling: sellMutation.isPending,
        error: purchaseMutation.error,
    };
};

export default useMarketActions;
