import Card from "components/Common/Card";

import styles from "./ContractProgress.module.css";

type ContractProgressProps = {
    activeContractProgress: {
        id: string;
        label: string;
        progress: number;
        remaining: number;
    }[];
};

const ContractProgress = ({
    activeContractProgress,
}: ContractProgressProps) => {
    return (
        <Card title="Contract Progress" subTitle="Remaining units by contract">
            {activeContractProgress.length > 0 ? (
                <div className={styles.progressList}>
                    {activeContractProgress.map((contract) => (
                        <div key={contract.id} className={styles.progressItem}>
                            <div className={styles.progressMeta}>
                                <span>{contract.label}</span>
                                <span>
                                    {Math.round(contract.progress * 100)}%
                                </span>
                            </div>
                            <div className={styles.progressTrack}>
                                <span
                                    className={styles.progressFill}
                                    style={{
                                        width: `${Math.round(
                                            contract.progress * 100,
                                        )}%`,
                                    }}
                                />
                            </div>
                            <p className={styles.progressFoot}>
                                {contract.remaining} units remaining
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className={styles.emptyState}>No active contracts yet.</p>
            )}
        </Card>
    );
};

export default ContractProgress;
