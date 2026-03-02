import { useMutation } from "@tanstack/react-query";
import {
    acceptContract,
    deliverCargoToContract,
    fulfillContract,
    negotiateContract,
} from "services/Contracts/contractMutationService";
import type { Contract } from "types/Contract/Contract";
import { useSpaceTradersStore } from "../../store/spaceTradersStore";
import type { TradeSymbol } from "types/Common";

const useMutateContract = (shipSymbol: string) => {
    const setContracts = useSpaceTradersStore((state) => state.setContracts);
    const setShipCargo = useSpaceTradersStore((state) => state.setShipCargo);

    const acceptContractMutation = useMutation({
        mutationKey: ["acceptContract"],
        mutationFn: async (contractId: string) => {
            const response = await acceptContract(contractId);
            setContracts((prevContracts: Contract[]) => {
                const updatedContract = response.data.data.contract as Contract;
                return prevContracts.map((contract) =>
                    contract.id === updatedContract.id
                        ? updatedContract
                        : contract,
                );
            });
            return response.data.data.contract as Contract;
        },
    });

    const fulfillContractMutation = useMutation({
        mutationKey: ["fulfillContract"],
        mutationFn: async (contractId: string) => {
            const response = await fulfillContract(contractId);
            setContracts((prevContracts: Contract[]) => {
                const updatedContract = response.data.data.contract as Contract;
                return prevContracts.map((contract) =>
                    contract.id === updatedContract.id
                        ? updatedContract
                        : contract,
                );
            });
            return response.data.data.contract as Contract;
        },
    });

    const deliverCargoToContractMutation = useMutation({
        mutationKey: ["deliverCargoToContract"],
        mutationFn: async ({
            contractId,
            tradeSymbol,
            units,
        }: {
            contractId: string;
            tradeSymbol: TradeSymbol;
            units: number;
        }) => {
            const response = await deliverCargoToContract(
                contractId,
                shipSymbol,
                tradeSymbol,
                units,
            );
            setContracts((prevContracts: Contract[]) => {
                const updatedContract = response.data.data.contract as Contract;
                return prevContracts.map((contract) =>
                    contract.id === updatedContract.id
                        ? updatedContract
                        : contract,
                );
            });
            setShipCargo(response.data.data.cargo);
            return response.data.data.contract as Contract;
        },
    });

    const negotiateContractMutation = useMutation({
        mutationKey: ["negotiateContract", shipSymbol],
        mutationFn: async () => {
            const response = await negotiateContract(shipSymbol);
            setContracts((prevContracts: Contract[]) => {
                const newContract = response.data.data.contract as Contract;
                const existingIndex = prevContracts.findIndex(
                    (contract) => contract.id === newContract.id,
                );
                if (existingIndex !== -1) {
                    const updatedContracts = [...prevContracts];
                    updatedContracts[existingIndex] = newContract;
                    return updatedContracts;
                }
                return [...prevContracts, newContract];
            });
            return response.data.data.contract as Contract;
        },
    });

    return {
        acceptContract: acceptContractMutation,
        fulfillContract: fulfillContractMutation,
        deliverCargoToContract: deliverCargoToContractMutation,
        negotiateContract: negotiateContractMutation,
    };
};

export default useMutateContract;
