import { useMutation, useQueryClient } from "@tanstack/react-query";

import { purchaseShip } from "services/shipyardActions";

const useShipyardActions = (systemSymbol?: string, waypointSymbol?: string) => {
    const queryClient = useQueryClient();

    const invalidateShipyard = () => {
        if (systemSymbol && waypointSymbol) {
            queryClient.invalidateQueries({
                queryKey: ["shipyard", systemSymbol, waypointSymbol],
            });
        }

        queryClient.invalidateQueries({ queryKey: ["ships"] });
        queryClient.invalidateQueries({ queryKey: ["agent"] });
    };

    const purchaseMutation = useMutation({
        mutationFn: async (shipType: string) => {
            if (!waypointSymbol) {
                throw new Error("Waypoint symbol required");
            }

            return purchaseShip(shipType, waypointSymbol);
        },
        onSuccess: invalidateShipyard,
    });

    return {
        purchase: purchaseMutation.mutateAsync,
        isPurchasing: purchaseMutation.isPending,
        error: purchaseMutation.error,
    };
};

export default useShipyardActions;
