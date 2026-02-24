import useGetStatus from "hooks/status/useGetStatus";

import Card from "components/Common/Card";

import styles from "./Announcements.module.css";

const Announcements = () => {
    const {
        data: serverStatus,
        isLoading: serverStatusLoading,
        isError: serverStatusError,
    } = useGetStatus();

    return (
        <Card
            title="Server Announcements"
            subTitle="Recent Updates from Space Traders"
        >
            {serverStatusLoading ? (
                <p className={styles.emptyState}>Loading server status...</p>
            ) : serverStatusError ? (
                <p className={styles.emptyState}>
                    Unable to load server status.
                </p>
            ) : (
                <div className={styles.statusAnnouncements}>
                    {serverStatus?.announcements?.length ? (
                        <ul className={styles.statusList}>
                            {serverStatus.announcements.map((item, index) => (
                                <li
                                    key={`${item.title ?? "announcement"}-${index}`}
                                    className={styles.statusListItem}
                                >
                                    <strong>{item.title ?? "Untitled"}</strong>
                                    <span className={styles.statusListBody}>
                                        {item.body ?? "No details provided."}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className={styles.statusEmpty}>No announcements.</p>
                    )}
                </div>
            )}
        </Card>
    );
};

export default Announcements;
