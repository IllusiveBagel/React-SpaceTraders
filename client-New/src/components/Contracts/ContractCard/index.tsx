import type { Contract } from "types/Contract";
import styles from "./ContractCard.module.css";
import ProgressBar from "components/Common/ProgressBar";
import { formatDateTime } from "helpers/fleetFormatters";
import useMutateContract from "hooks/Contracts/useMutateContract";

type ContractCardProps = {
    shipSymbol: string;
    contract: Contract;
};

const ContractCard = ({ shipSymbol, contract }: ContractCardProps) => {
    const { acceptContract: accept, fulfillContract: fulfill } =
        useMutateContract(shipSymbol);

    const statusColor = contract.fulfilled
        ? styles.statusFulfilled
        : contract.accepted
          ? styles.statusAccepted
          : styles.statusPending;
    const deliveriesComplete = contract.terms.deliver.every(
        (delivery) => delivery.unitsFulfilled >= delivery.unitsRequired,
    );
    const actionDisabled = accept.isPending || fulfill.isPending;

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
                            {accept.error && (
                                <span className={styles.actionMessage}>
                                    {accept.error?.message ||
                                        "Error accepting contract"}
                                </span>
                            )}
                            {fulfill.error && (
                                <span className={styles.actionMessage}>
                                    {fulfill.error?.message ||
                                        "Error fulfilling contract"}
                                </span>
                            )}
                        </div>
                    </div>

                    {!contract.accepted && (
                        <p className={styles.actionHint}>
                            Contract must be accepted before deliveries.
                        </p>
                    )}

                    {!contract.accepted && (
                        <button
                            type="button"
                            className={styles.actionPrimary}
                            onClick={() => accept.mutate(contract.id)}
                            disabled={actionDisabled}
                        >
                            Accept contract
                        </button>
                    )}

                    <button
                        type="button"
                        className={styles.actionPrimary}
                        onClick={() => fulfill.mutate(contract.id)}
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
