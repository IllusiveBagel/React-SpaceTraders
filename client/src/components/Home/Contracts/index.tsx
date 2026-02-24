import { useEffect, useMemo, useState } from "react";

import useGetContracts from "hooks/contracts/useGetContracts";
import useGetShips from "hooks/fleet/useGetShips";
import useNegotiateContract from "hooks/contracts/useNegotiateContract";
import ContractCard from "components/Home/ContractCard";

import styles from "./Contracts.module.css";

const Contracts = () => {
    const { data: contracts, isLoading, error } = useGetContracts();
    const { data: ships, isLoading: shipsLoading } = useGetShips();
    const negotiateMutation = useNegotiateContract();
    const [activeContractId, setActiveContractId] = useState<string | null>(
        null,
    );
    const [selectedShipSymbol, setSelectedShipSymbol] = useState("");
    const [actionMessage, setActionMessage] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    const openContracts = useMemo(
        () => (contracts ?? []).filter((contract) => !contract.fulfilled),
        [contracts],
    );
    const activeContract = useMemo(
        () =>
            openContracts.find(
                (contract) => contract.id === activeContractId,
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

    const handleNegotiate = async () => {
        setActionError(null);
        setActionMessage(null);

        if (!selectedShipSymbol) {
            setActionError("Select a ship to negotiate a contract.");
            return;
        }

        try {
            await negotiateMutation.mutateAsync(selectedShipSymbol);
            setActionMessage("Negotiated a new contract.");
        } catch (err) {
            setActionError(
                err instanceof Error ? err.message : "Negotiation failed.",
            );
        }
    };

    if (isLoading)
        return <div className={styles.loading}>Loading contracts...</div>;
    if (error)
        return <div className={styles.error}>Error loading contracts.</div>;

    if (!contracts) {
        return null;
    }

    return (
        <div className={styles.contracts}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Contracts</h1>
                    <p className={styles.subtitle}>
                        {openContracts.length} open contract
                        {openContracts.length === 1 ? "" : "s"}
                    </p>
                </div>
                <div className={styles.negotiatePanel}>
                    <div className={styles.negotiateStatus}>
                        {actionError && (
                            <span className={styles.actionError}>
                                {actionError}
                            </span>
                        )}
                        {actionMessage && (
                            <span className={styles.actionMessage}>
                                {actionMessage}
                            </span>
                        )}
                    </div>
                    <div className={styles.negotiateControls}>
                        <select
                            value={selectedShipSymbol}
                            onChange={(event) =>
                                setSelectedShipSymbol(event.target.value)
                            }
                            disabled={
                                shipsLoading || negotiateMutation.isPending
                            }
                        >
                            <option value="">Select ship</option>
                            {(ships ?? []).map((ship) => (
                                <option key={ship.symbol} value={ship.symbol}>
                                    {ship.registration.name} ({ship.symbol})
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={handleNegotiate}
                            disabled={
                                shipsLoading ||
                                negotiateMutation.isPending ||
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
                        {openContracts.map((contract, index) => (
                            <button
                                key={contract.id}
                                type="button"
                                className={`${styles.tab} ${
                                    contract.id === activeContract?.id
                                        ? styles.tabActive
                                        : ""
                                }`}
                                onClick={() => setActiveContractId(contract.id)}
                                role="tab"
                                aria-selected={
                                    contract.id === activeContract?.id
                                }
                                aria-controls={`contract-tab-${contract.id}`}
                                id={`contract-tab-${contract.id}-button`}
                            >
                                {getContractLabel(index)}
                            </button>
                        ))}
                    </div>

                    {activeContract && (
                        <div
                            className={styles.tabPanel}
                            role="tabpanel"
                            id={`contract-tab-${activeContract.id}`}
                            aria-labelledby={`contract-tab-${activeContract.id}-button`}
                        >
                            <ContractCard contract={activeContract} />
                        </div>
                    )}
                </>
            ) : (
                <p className={styles.empty}>No open contracts found.</p>
            )}
        </div>
    );
};

export default Contracts;
