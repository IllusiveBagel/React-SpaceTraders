import useGetAgent from "hooks/agent/useGetAgent";

import styles from "./AgentInfo.module.css";

const AgentInfo = () => {
    const { data: agent, isLoading, error } = useGetAgent();

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error loading agent information.</p>;

    return (
        <>
            {agent && (
                <div className={styles.agentInfo}>
                    <h1 className={styles.title}>Agent Information</h1>
                    <div className={styles.list}>
                        <div className={styles.item}>
                            <span className={styles.label}>Account ID</span>
                            <span className={styles.value}>
                                {agent.accountId}
                            </span>
                        </div>
                        <div className={styles.item}>
                            <span className={styles.label}>Symbol</span>
                            <span className={styles.value}>{agent.symbol}</span>
                        </div>
                        <div className={styles.item}>
                            <span className={styles.label}>Headquarters</span>
                            <span className={styles.value}>
                                {agent.headquarters}
                            </span>
                        </div>
                        <div className={styles.item}>
                            <span className={styles.label}>Credits</span>
                            <span className={styles.value}>
                                {agent.credits}
                            </span>
                        </div>
                        <div className={styles.item}>
                            <span className={styles.label}>
                                Starting Faction
                            </span>
                            <span className={styles.value}>
                                {agent.startingFaction}
                            </span>
                        </div>
                        <div className={styles.item}>
                            <span className={styles.label}>Ship Count</span>
                            <span className={styles.value}>
                                {agent.shipCount}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AgentInfo;
