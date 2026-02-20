import { useMutation, useQueryClient } from "@tanstack/react-query";

import { negotiateContract } from "services/contractActions";

const useNegotiateContract = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (shipSymbol: string) => {
            if (!shipSymbol) {
                throw new Error("Ship symbol required");
            }

            return negotiateContract(shipSymbol);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["contracts"] });
        },
    });
};

export default useNegotiateContract;
