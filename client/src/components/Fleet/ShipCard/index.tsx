import { Link, useNavigate } from "react-router-dom";

import type { Ship } from "types/fleet";

import styles from "./ShipCard.module.css";
import { formatDuration, formatPercent } from "helpers/fleetFormatters";
import ProgressBar from "components/Home/ProgressBar";
import useTransitProgress from "hooks/fleet/useTransitProgress";

type ShipCardProps = {
    ship: Ship;
};

const getStatusClass = (ship: Ship) => {
    return ship.nav.status === "IN_TRANSIT"
        ? styles.statusTransit
        : styles.statusDocked;
};

const ShipCard = ({ ship }: ShipCardProps) => {
    const navigate = useNavigate();
    const transit = useTransitProgress(ship);

    const handleCardClick = () => {
        navigate(`/fleet/${ship.symbol}`);
    };

    const handleCardKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            navigate(`/fleet/${ship.symbol}`);
        }
    };

    return (
        <article
            className={`${styles.card} ${styles.cardLink}`}
            onClick={handleCardClick}
            onKeyDown={handleCardKeyDown}
            role="link"
            tabIndex={0}
        >
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
                    <Link
                        to={`/systems/${ship.nav.systemSymbol}`}
                        className={styles.locationLink}
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={(event) => event.stopPropagation()}
                    >
                        {ship.nav.waypointSymbol}
                    </Link>
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
                    <span className={styles.label}>Cooldown</span>
                    <span className={styles.value}>
                        {ship.cooldown.remainingSeconds > 0
                            ? `${ship.cooldown.remainingSeconds}s`
                            : "Ready"}
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

            {transit.isInTransit && (
                <div className={styles.transit}>
                    <div className={styles.transitHeader}>
                        <span className={styles.transitLabel}>In transit</span>
                        <span className={styles.transitEta}>
                            ETA {formatDuration(transit.remainingSeconds)}
                        </span>
                    </div>
                    <ProgressBar
                        current={transit.elapsedSeconds}
                        total={transit.totalSeconds}
                    />
                    {transit.arrivalTime && (
                        <span className={styles.transitArrival}>
                            Arrival {transit.arrivalTime}
                        </span>
                    )}
                </div>
            )}
        </article>
    );
};

export default ShipCard;
