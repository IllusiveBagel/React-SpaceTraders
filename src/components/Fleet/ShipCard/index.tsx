import type { Ship } from "types/fleet";

import styles from "./ShipCard.module.css";
import { formatPercent } from "helpers/fleetFormatters";
import ShipDetails from "components/Fleet/ShipDetails";

type ShipCardProps = {
    ship: Ship;
};

const getStatusClass = (ship: Ship) => {
    return ship.nav.status === "IN_TRANSIT"
        ? styles.statusTransit
        : styles.statusDocked;
};

const ShipCard = ({ ship }: ShipCardProps) => {
    return (
        <article className={styles.card}>
            <div className={styles.cardTop}>
                <div>
                    <h2 className={styles.shipName}>
                        {ship.registration.name}
                    </h2>
                    <p className={styles.shipMeta}>
                        {ship.symbol} • {ship.registration.role}
                    </p>
                </div>
                <span className={`${styles.status} ${getStatusClass(ship)}`}>
                    {ship.nav.status}
                </span>
            </div>

            <div className={styles.metrics}>
                <div className={styles.metric}>
                    <span className={styles.label}>Location</span>
                    <span className={styles.value}>
                        {ship.nav.waypointSymbol}
                    </span>
                </div>
                <div className={styles.metric}>
                    <span className={styles.label}>Fuel</span>
                    <span className={styles.value}>
                        {ship.fuel.current}/{ship.fuel.capacity} (
                        {formatPercent(ship.fuel.current, ship.fuel.capacity)})
                    </span>
                </div>
                <div className={styles.metric}>
                    <span className={styles.label}>Cargo</span>
                    <span className={styles.value}>
                        {ship.cargo.units}/{ship.cargo.capacity} (
                        {formatPercent(ship.cargo.units, ship.cargo.capacity)})
                    </span>
                </div>
                <div className={styles.metric}>
                    <span className={styles.label}>Crew</span>
                    <span className={styles.value}>
                        {ship.crew.current}/{ship.crew.required}/
                        {ship.crew.capacity}
                    </span>
                </div>
            </div>

            <details className={styles.details}>
                <summary className={styles.summary}>More details</summary>
                <ShipDetails ship={ship} />
            </details>
        </article>
    );
};

export default ShipCard;
