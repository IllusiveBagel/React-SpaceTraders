import { useEffect, useMemo, useState } from "react";

import { useShipsWithStore } from "hooks/Ship";
import useContractsWithStore from "hooks/Contracts/useContractsWithStore";
import useMutateContract from "hooks/Contracts/useMutateContract";

import Container from "components/Common/Container";
import ContractCard from "components/Contracts/ContractCard";

import type { Contract } from "types/Contract";
import type { Ship } from "types/Ship";

import styles from "./Contracts.module.css";

const ContractsPage = () => {
    const { ships, isLoading: shipsLoading } = useShipsWithStore();
    const { contracts, isLoading, error } = useContractsWithStore();

    const [activeContractId, setActiveContractId] = useState<string | null>(
        null,
    );
    const [selectedShipSymbol, setSelectedShipSymbol] = useState("");

    const openContracts = useMemo(
        () =>
            (contracts ?? []).filter(
                (contract: Contract) => !contract.fulfilled,
            ),
        [contracts],
    );
    const activeContract = useMemo(
        () =>
            openContracts.find(
                (contract: Contract) => contract.id === activeContractId,
            ) ??
            openContracts[0] ??
            null,
        [activeContractId, openContracts],
    );
    const defaultShipSymbol = useMemo(() => ships?.[0]?.symbol ?? "", [ships]);

    useEffect(() => {
        if (openContracts.length > 0 && !activeContractId) {
            setActiveContractId(openContracts[0].id);
        }
    }, [activeContractId, openContracts]);

    useEffect(() => {
        if (!selectedShipSymbol && defaultShipSymbol) {
            setSelectedShipSymbol(defaultShipSymbol);
        }
    }, [defaultShipSymbol, selectedShipSymbol]);

    const { negotiateContract } = useMutateContract(selectedShipSymbol);

    const getContractLabel = (index: number) => {
        if (!openContracts[index]) {
            return "Contract";
        }

        const contract = openContracts[index];
        const firstDelivery = contract.terms.deliver[0];
        const deliveryLabel = firstDelivery
            ? `${firstDelivery.tradeSymbol} → ${firstDelivery.destinationSymbol}`
            : "No deliveries";

        return `${contract.type} • ${deliveryLabel}`;
    };

    if (isLoading)
        return <div className={styles.loading}>Loading contracts...</div>;
    if (error)
        return <div className={styles.error}>Error loading contracts.</div>;

    if (!contracts) {
        return null;
    }

    return (
        <Container>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Contracts</h1>
                    <p className={styles.subtitle}>
                        {openContracts.length} open contract
                        {openContracts.length === 1 ? "" : "s"}
                    </p>
                </div>
                <div className={styles.negotiatePanel}>
                    <div className={styles.negotiateControls}>
                        <select
                            value={selectedShipSymbol}
                            onChange={(event) =>
                                setSelectedShipSymbol(event.target.value)
                            }
                            disabled={
                                shipsLoading || negotiateContract.isPending
                            }
                        >
                            <option value="">Select ship</option>
                            {(ships ?? []).map((ship: Ship) => (
                                <option key={ship.symbol} value={ship.symbol}>
                                    {ship.registration.name} ({ship.symbol})
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={() => negotiateContract.mutate()}
                            disabled={
                                shipsLoading ||
                                negotiateContract.isPending ||
                                !selectedShipSymbol
                            }
                        >
                            Negotiate new contract
                        </button>
                    </div>
                </div>
            </div>

            {openContracts.length > 0 ? (
                <>
                    <div className={styles.tabs} role="tablist">
                        {openContracts.map(
                            (contract: Contract, index: number) => (
                                <button
                                    key={contract.id}
                                    type="button"
                                    className={`${styles.tab} ${
                                        contract.id === activeContract?.id
                                            ? styles.tabActive
                                            : ""
                                    }`}
                                    onClick={() =>
                                        setActiveContractId(contract.id)
                                    }
                                    role="tab"
                                    aria-selected={
                                        contract.id === activeContract?.id
                                    }
                                    aria-controls={`contract-tab-${contract.id}`}
                                    id={`contract-tab-${contract.id}-button`}
                                >
                                    {getContractLabel(index)}
                                </button>
                            ),
                        )}
                    </div>

                    {activeContract && (
                        <div
                            className={styles.tabPanel}
                            role="tabpanel"
                            id={`contract-tab-${activeContract.id}`}
                            aria-labelledby={`contract-tab-${activeContract.id}-button`}
                        >
                            <ContractCard
                                shipSymbol={selectedShipSymbol}
                                contract={activeContract}
                            />
                        </div>
                    )}
                </>
            ) : (
                <p className={styles.empty}>No open contracts found.</p>
            )}
        </Container>
    );
};

export default ContractsPage;
