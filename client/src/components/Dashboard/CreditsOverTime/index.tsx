import { useMemo } from "react";

import { formatNumber } from "helpers/formatNumber";

import Card from "components/Common/Card";

import styles from "./CreditsOverTime.module.css";

const CreditsOverTime = ({
    creditsHistory,
}: {
    creditsHistory: { ts: number; value: number }[];
}) => {
    const buildSparklinePath = (
        values: number[],
        width = 260,
        height = 90,
        padding = 8,
    ) => {
        if (values.length === 0) return "";

        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min || 1;
        const span = values.length - 1 || 1;

        return values
            .map((value, index) => {
                const x = padding + (index / span) * (width - padding * 2);
                const y =
                    padding +
                    (1 - (value - min) / range) * (height - padding * 2);
                return `${index === 0 ? "M" : "L"}${x} ${y}`;
            })
            .join(" ");
    };

    const creditsValues = useMemo(
        () => creditsHistory.map((point) => point.value),
        [creditsHistory],
    );

    const creditsDelta = useMemo(() => {
        if (creditsValues.length < 2) return 0;
        return creditsValues[creditsValues.length - 1] - creditsValues[0];
    }, [creditsValues]);

    const sparklinePath = useMemo(
        () => buildSparklinePath(creditsValues),
        [creditsValues],
    );

    return (
        <Card
            title="Credits over time"
            subTitle="Last saved snapshots"
            cardWide
        >
            <div
                className={`${
                    styles.trend
                } ${creditsDelta >= 0 ? styles.trendUp : styles.trendDown}`}
            >
                {creditsDelta >= 0 ? "+" : ""}
                {formatNumber(creditsDelta)}
            </div>
            {creditsValues.length > 1 ? (
                <svg
                    className={styles.sparkline}
                    viewBox="0 0 260 90"
                    role="img"
                    aria-label="Credits sparkline"
                >
                    <path className={styles.sparklinePath} d={sparklinePath} />
                </svg>
            ) : (
                <p className={styles.emptyState}>
                    Collecting your first data points.
                </p>
            )}
        </Card>
    );
};

export default CreditsOverTime;
