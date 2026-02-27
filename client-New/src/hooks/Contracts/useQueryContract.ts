import { useQuery } from "@tanstack/react-query";
import {
    getContract,
    getContracts,
} from "services/Contracts/contractQueryService";
import type { Contract } from "types/Contract";
import { useSpaceTradersStore } from "store/spaceTradersStore";

const fetchOptions = {
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
};

const useQueryContract = (contractId?: string) => {
    const setContracts = useSpaceTradersStore((state) => state.setContracts);

    const useContractsQuery = () => {
        return useQuery<Contract[]>({
            queryKey: ["contracts"],
            queryFn: async () => {
                const response = await getContracts();
                setContracts(response.data.data as Contract[]);
                return response.data.data as Contract[];
            },
            ...fetchOptions,
        });
    };

    const useContractQuery = () => {
        return useQuery<Contract>({
            queryKey: ["contract", contractId],
            queryFn: async () => {
                const response = await getContract(contractId!);
                return response.data.data as Contract;
            },
            enabled: !!contractId,
            ...fetchOptions,
        });
    };

    return { useContractsQuery, useContractQuery };
};

export default useQueryContract;
