import ShipCard from "components/Fleet/ShipCard";
import styles from "./Fleet.module.css";
import { useShipsWithStore } from "hooks/Ship";
import type { Ship } from "types/Ship";

const Fleet = () => {
    const { ships, isLoading, error } = useShipsWithStore();

    if (isLoading) {
        return (
            <section className={styles.fleet}>
                <p className={styles.state}>Loading ships...</p>
            </section>
        );
    }

    if (error) {
        return (
            <section className={styles.fleet}>
                <p className={styles.state}>
                    Error loading ships: {error.message}
                </p>
            </section>
        );
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
                    {ships.map((ship: Ship) => (
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
