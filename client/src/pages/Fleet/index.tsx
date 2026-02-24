import useGetShips from "hooks/fleet/useGetShips";
import ShipCard from "components/Fleet/ShipCard";
import { usePageTitle } from "components/Layout/PageTitleContext";
import styles from "./Fleet.module.css";

const Fleet = () => {
    usePageTitle("Fleet");

    const { data: ships, isLoading, error } = useGetShips();

    if (isLoading) {
        return <div className={styles.state}>Loading fleet...</div>;
    }

    if (error) {
        return <div className={styles.error}>Error: {error.message}</div>;
    }

    return (
        <section className={styles.fleet}>
            <div className={styles.header}>
                <p className={styles.subtitle}>
                    {ships?.length ?? 0} ship{ships?.length === 1 ? "" : "s"}
                </p>
            </div>

            {ships && ships.length > 0 ? (
                <div className={styles.list}>
                    {ships.map((ship) => (
                        <ShipCard key={ship.symbol} ship={ship} />
                    ))}
                </div>
            ) : (
                <p className={styles.state}>No ships found.</p>
            )}
        </section>
    );
};

export default Fleet;
