import { useEffect, useMemo, useState } from "react";

import type { Contract } from "types/contract";
import type { Ship } from "types/fleet";
import styles from "./ContractCard.module.css";
import ProgressBar from "components/Home/ProgressBar";
import useGetShips from "hooks/fleet/useGetShips";
import useContractActions from "hooks/contracts/useContractActions";
import { formatDateTime } from "helpers/fleetFormatters";

type ContractCardProps = {
    contract: Contract;
};

const ContractCard = ({ contract }: ContractCardProps) => {
    const { data: ships, isLoading: shipsLoading } = useGetShips();
    const { deliver, fulfill, isWorking } = useContractActions(contract.id);
    const [selectedShipSymbol, setSelectedShipSymbol] = useState("");
    const [deliveryUnits, setDeliveryUnits] = useState<Record<string, string>>(
        {},
    );
    const [actionMessage, setActionMessage] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const statusColor = contract.fulfilled
        ? styles.statusFulfilled
        : contract.accepted
          ? styles.statusAccepted
          : styles.statusPending;
    const deliveriesComplete = contract.terms.deliver.every(
        (delivery) => delivery.unitsFulfilled >= delivery.unitsRequired,
    );
    const defaultShipSymbol = useMemo(() => ships?.[0]?.symbol ?? "", [ships]);
    const selectedShip = useMemo<Ship | undefined>(
        () => ships?.find((ship) => ship.symbol === selectedShipSymbol),
        [ships, selectedShipSymbol],
    );
    const actionDisabled = isWorking || shipsLoading;

    useEffect(() => {
        if (!selectedShipSymbol && defaultShipSymbol) {
            setSelectedShipSymbol(defaultShipSymbol);
        }
    }, [defaultShipSymbol, selectedShipSymbol]);

    const handleAction = async (
        action: () => Promise<unknown>,
        message: string,
    ) => {
        setActionError(null);
        setActionMessage(null);

        try {
            await action();
            setActionMessage(message);
        } catch (err) {
            setActionError(
                err instanceof Error ? err.message : "Action failed.",
            );
        }
    };

    const getAvailableUnits = (tradeSymbol: string) => {
        if (!selectedShip) {
            return 0;
        }

        return (
            selectedShip.cargo.inventory.find(
                (item) => item.symbol === tradeSymbol,
            )?.units ?? 0
        );
    };

    const handleDeliver = async (
        delivery: Contract["terms"]["deliver"][number],
        key: string,
    ) => {
        if (!contract.accepted) {
            setActionError("Accept the contract before delivering cargo.");
            return;
        }

        if (contract.fulfilled) {
            setActionError("Contract already fulfilled.");
            return;
        }

        if (!selectedShipSymbol) {
            setActionError("Select a ship to deliver cargo.");
            return;
        }

        const remainingUnits = Math.max(
            0,
            delivery.unitsRequired - delivery.unitsFulfilled,
        );
        if (remainingUnits === 0) {
            setActionError("Delivery already completed.");
            return;
        }

        const availableUnits = getAvailableUnits(delivery.tradeSymbol);
        if (availableUnits === 0) {
            setActionError(
                `Selected ship has no ${delivery.tradeSymbol} cargo.`,
            );
            return;
        }

        const desiredUnits = deliveryUnits[key]?.trim();
        const resolvedUnits = desiredUnits
            ? Number(desiredUnits)
            : Math.min(availableUnits, remainingUnits);

        if (!resolvedUnits || Number.isNaN(resolvedUnits)) {
            setActionError("Enter a valid unit count to deliver.");
            return;
        }

        const maxUnits = Math.min(availableUnits, remainingUnits);
        if (resolvedUnits > maxUnits) {
            setActionError(
                `Max deliverable units: ${maxUnits} (available ${availableUnits}, remaining ${remainingUnits}).`,
            );
            return;
        }

        await handleAction(
            () =>
                deliver({
                    shipSymbol: selectedShipSymbol,
                    tradeSymbol: delivery.tradeSymbol,
                    units: resolvedUnits,
                }),
            `Delivering ${resolvedUnits} ${delivery.tradeSymbol}.`,
        );
    };

    const handleFulfill = async () => {
        if (!contract.accepted) {
            setActionError("Accept the contract before fulfilling it.");
            return;
        }

        if (!deliveriesComplete) {
            setActionError("All deliveries must be completed first.");
            return;
        }

        await handleAction(() => fulfill(), "Contract fulfilled.");
    };

    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <div>
                    <h3 className={styles.contractType}>
                        {contract.type} Contract
                    </h3>
                    <p className={styles.factionSymbol}>
                        {contract.factionSymbol}
                    </p>
                </div>
                <div className={`${styles.badge} ${statusColor}`}>
                    {contract.fulfilled
                        ? "Fulfilled"
                        : contract.accepted
                          ? "Accepted"
                          : "Pending"}
                </div>
            </div>

            <div className={styles.cardBody}>
                <div className={styles.section}>
                    <span className={styles.sectionLabel}>Payment</span>
                    <div className={styles.paymentGrid}>
                        <div>
                            <span className={styles.label}>On Accept</span>
                            <span className={styles.value}>
                                {contract.terms.payment.onAccepted}
                            </span>
                        </div>
                        <div>
                            <span className={styles.label}>On Fulfill</span>
                            <span className={styles.value}>
                                {contract.terms.payment.onFulfilled}
                            </span>
                        </div>
                    </div>
                </div>

                <div className={styles.section}>
                    <span className={styles.sectionLabel}>Deadlines</span>
                    <div className={styles.deadlineGrid}>
                        <div>
                            <span className={styles.label}>Accept By</span>
                            <span className={styles.value}>
                                {formatDateTime(contract.deadlineToAccept)}
                            </span>
                        </div>
                        <div>
                            <span className={styles.label}>Fulfill By</span>
                            <span className={styles.value}>
                                {formatDateTime(contract.terms.deadline)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className={styles.section}>
                    <span className={styles.sectionLabel}>Deliveries</span>
                    <div className={styles.deliveryList}>
                        {contract.terms.deliver.map((delivery, idx) => (
                            <div key={idx} className={styles.deliveryItem}>
                                <div className={styles.deliveryMeta}>
                                    <span className={styles.label}>
                                        {delivery.tradeSymbol}
                                    </span>
                                    <span className={styles.label}>
                                        to {delivery.destinationSymbol}
                                    </span>
                                </div>
                                <ProgressBar
                                    current={delivery.unitsFulfilled}
                                    total={delivery.unitsRequired}
                                    label={`${delivery.unitsFulfilled} / ${delivery.unitsRequired} units`}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {contract.terms.deliver.length > 1 && (
                    <div className={styles.section}>
                        <span className={styles.sectionLabel}>Overall</span>
                        <ProgressBar
                            current={contract.terms.deliver.reduce(
                                (sum, d) => sum + d.unitsFulfilled,
                                0,
                            )}
                            total={contract.terms.deliver.reduce(
                                (sum, d) => sum + d.unitsRequired,
                                0,
                            )}
                            label="All deliveries"
                        />
                    </div>
                )}

                <div className={styles.actionSection}>
                    <div className={styles.actionHeader}>
                        <span className={styles.sectionLabel}>Actions</span>
                        <div className={styles.actionStatus}>
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
                    </div>

                    <div className={styles.actionRow}>
                        <label className={styles.actionLabel}>Ship</label>
                        <select
                            value={selectedShipSymbol}
                            onChange={(event) =>
                                setSelectedShipSymbol(event.target.value)
                            }
                            disabled={actionDisabled}
                        >
                            <option value="">Select ship</option>
                            {(ships ?? []).map((ship) => (
                                <option key={ship.symbol} value={ship.symbol}>
                                    {ship.registration.name} ({ship.symbol})
                                </option>
                            ))}
                        </select>
                    </div>

                    {!contract.accepted && (
                        <p className={styles.actionHint}>
                            Contract must be accepted before deliveries.
                        </p>
                    )}

                    <div className={styles.deliveryActions}>
                        {contract.terms.deliver.map((delivery, idx) => {
                            const key = `${delivery.tradeSymbol}-${idx}`;
                            const remainingUnits = Math.max(
                                0,
                                delivery.unitsRequired -
                                    delivery.unitsFulfilled,
                            );
                            const availableUnits = getAvailableUnits(
                                delivery.tradeSymbol,
                            );

                            return (
                                <div
                                    key={key}
                                    className={styles.deliveryAction}
                                >
                                    <div className={styles.deliveryActionMeta}>
                                        <span>
                                            {delivery.tradeSymbol} to{" "}
                                            {delivery.destinationSymbol}
                                        </span>
                                        <span>Remaining: {remainingUnits}</span>
                                        <span>Available: {availableUnits}</span>
                                    </div>
                                    <div className={styles.actionRow}>
                                        <input
                                            type="number"
                                            min={1}
                                            placeholder={`${Math.min(
                                                remainingUnits,
                                                availableUnits,
                                            )}`}
                                            value={deliveryUnits[key] ?? ""}
                                            onChange={(event) =>
                                                setDeliveryUnits((current) => ({
                                                    ...current,
                                                    [key]: event.target.value,
                                                }))
                                            }
                                            disabled={actionDisabled}
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDeliver(delivery, key)
                                            }
                                            disabled={actionDisabled}
                                        >
                                            Deliver
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <button
                        type="button"
                        className={styles.actionPrimary}
                        onClick={handleFulfill}
                        disabled={
                            actionDisabled ||
                            !contract.accepted ||
                            contract.fulfilled ||
                            !deliveriesComplete
                        }
                    >
                        Fulfill contract
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ContractCard;
