import useGetAgent from "hooks/agent/useGetAgent";

import styles from "./Header.module.css";

type HeaderProps = {
    isMobileNavOpen: boolean;
    onMobileNavToggle: () => void;
};

const Header = ({ isMobileNavOpen, onMobileNavToggle }: HeaderProps) => {
    const { data: agent, isLoading, error } = useGetAgent();
    const credits = agent
        ? new Intl.NumberFormat("en-US").format(agent.credits)
        : "--";

    return (
        <header className={styles.header}>
            <div className={styles.content}>
                <div className={styles.titleRow}>
                    <button
                        type="button"
                        className={styles.menuButton}
                        data-open={isMobileNavOpen}
                        aria-label={
                            isMobileNavOpen
                                ? "Close navigation menu"
                                : "Open navigation menu"
                        }
                        aria-expanded={isMobileNavOpen}
                        onClick={onMobileNavToggle}
                    >
                        <span className={styles.menuIcon} aria-hidden />
                    </button>
                </div>
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
