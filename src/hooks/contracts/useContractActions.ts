import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deliverContract, fulfillContract } from "services/contractActions";

type DeliverArgs = {
    shipSymbol: string;
    tradeSymbol: string;
    units: number;
};

const useContractActions = (contractId?: string) => {
    const queryClient = useQueryClient();

    const invalidateContracts = () => {
        queryClient.invalidateQueries({ queryKey: ["contracts"] });
    };

    const invalidateShip = (shipSymbol?: string) => {
        if (!shipSymbol) {
            return;
        }

        queryClient.invalidateQueries({ queryKey: ["ship", shipSymbol] });
        queryClient.invalidateQueries({ queryKey: ["ships"] });
    };

    const deliverMutation = useMutation({
        mutationFn: async (payload: DeliverArgs) => {
            if (!contractId) {
                throw new Error("Contract id required");
            }

            return deliverContract(contractId, payload);
        },
        onSuccess: (_data, variables) => {
            invalidateContracts();
            invalidateShip(variables.shipSymbol);
        },
    });

    const fulfillMutation = useMutation({
        mutationFn: async () => {
            if (!contractId) {
                throw new Error("Contract id required");
            }

            return fulfillContract(contractId);
        },
        onSuccess: invalidateContracts,
    });

    return {
        deliver: deliverMutation.mutateAsync,
        fulfill: fulfillMutation.mutateAsync,
        isWorking: deliverMutation.isPending || fulfillMutation.isPending,
        error: deliverMutation.error || fulfillMutation.error,
    };
};

export default useContractActions;
