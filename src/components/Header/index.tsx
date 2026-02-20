import useGetAgent from "hooks/agent/useGetAgent";
import { usePageTitleContext } from "components/Layout/PageTitleContext";

import styles from "./Header.module.css";

const Header = () => {
    const { data: agent, isLoading, error } = useGetAgent();
    const { title } = usePageTitleContext();
    const credits = agent
        ? new Intl.NumberFormat("en-US").format(agent.credits)
        : "--";

    return (
        <header className={styles.header}>
            <div className={styles.content}>
                <h1 className={styles.title}>{title}</h1>
                <div className={styles.agentPanel}>
                    {isLoading && (
                        <span className={styles.agentValue}>Loading...</span>
                    )}
                    {!isLoading && error && (
                        <span className={styles.agentValue}>Unavailable</span>
                    )}
                    {!isLoading && !error && agent && (
                        <div className={styles.agentMeta}>
                            <div className={styles.agentItem}>
                                <span className={styles.agentValue}>
                                    {agent.symbol}
                                </span>
                            </div>
                            <div className={styles.agentItem}>
                                <span className={styles.agentKey}>Credits</span>
                                <span className={styles.agentValue}>
                                    {credits}
                                </span>
                            </div>
                            <div className={styles.agentItem}>
                                <span className={styles.agentKey}>Faction</span>
                                <span className={styles.agentValue}>
                                    {agent.startingFaction}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
