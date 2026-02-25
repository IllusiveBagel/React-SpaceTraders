import { useMutation } from "@tanstack/react-query";
import { purchaseShip } from "../services/Ship/shipMutationService";

const useMutateShip = (shipSymbol?: string) => {
    const purchaseShipMutation = useMutation({
        mutationKey: ["purchaseShip"],
        mutationFn: async ({
            shipType,
            location,
        }: {
            shipType: string;
            location: string;
        }) => {
            return purchaseShip(shipType, location);
        },
    });

    return {
        purchaseShipMutation,
    };
};

export default useMutateShip;
