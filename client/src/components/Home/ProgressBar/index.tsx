type ProgressBarProps = {
    current: number;
    total: number;
    label?: string;
};

import styles from "./ProgressBar.module.css";

const ProgressBar = ({ current, total, label }: ProgressBarProps) => {
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

    return (
        <div className={styles.progressContainer}>
            {label && <span className={styles.label}>{label}</span>}
            <div className={styles.barWrapper}>
                <div className={styles.barBackground}>
                    <div
                        className={styles.barFill}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <span className={styles.percentage}>{percentage}%</span>
            </div>
        </div>
    );
};

export default ProgressBar;
