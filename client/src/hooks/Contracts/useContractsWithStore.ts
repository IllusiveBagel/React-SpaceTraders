import { useEffect } from "react";
import { useSpaceTradersStore } from "../../store/spaceTradersStore";
import { useQueryContract } from "./";

const useContractsWithStore = () => {
    const contracts = useSpaceTradersStore((state: any) => state.contracts);
    const setContracts = useSpaceTradersStore(
        (state: any) => state.setContracts,
    );
    const { useContractsQuery } = useQueryContract();
    const getContracts = useContractsQuery();

    // If Zustand contracts are empty, fetch from API and update Zustand
    useEffect(() => {
        if (
            (!contracts || contracts.length === 0) &&
            getContracts.data &&
            !getContracts.isFetching
        ) {
            setContracts(getContracts.data);
        }
    }, [contracts, getContracts.data, getContracts.isFetching, setContracts]);

    // Optionally, trigger fetch if contracts are empty
    useEffect(() => {
        if (!contracts || contracts.length === 0) {
            getContracts.refetch();
        }
    }, [contracts, getContracts.refetch]);

    return {
        contracts,
        isLoading:
            getContracts.isLoading && (!contracts || contracts.length === 0),
        error: getContracts.error,
    };
};

export default useContractsWithStore;
