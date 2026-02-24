import type { Ship } from "types/fleet";

import styles from "./ShipDetails.module.css";
import { formatDateTime, formatRequirements } from "helpers/fleetFormatters";
import DetailBlock from "components/Fleet/DetailBlock";
import DetailField from "components/Fleet/DetailField";

type ShipDetailsProps = {
    ship: Ship;
};

const ShipDetails = ({ ship }: ShipDetailsProps) => {
    return (
        <div className={styles.detailsGrid}>
            <DetailBlock title="Navigation">
                <DetailField label="Status" value={ship.nav.status} />
                <DetailField label="Flight Mode" value={ship.nav.flightMode} />
                <DetailField label="System" value={ship.nav.systemSymbol} />
                <DetailField label="Waypoint" value={ship.nav.waypointSymbol} />
                <DetailField
                    label="Route"
                    value={`${ship.nav.route.origin.symbol} → ${ship.nav.route.destination.symbol}`}
                />
                <DetailField
                    label="Arrival"
                    value={formatDateTime(ship.nav.route.arrival)}
                />
                <DetailField
                    label="Departure"
                    value={formatDateTime(ship.nav.route.departureTime)}
                />
                <DetailField
                    label="Origin Type"
                    value={ship.nav.route.origin.type}
                />
                <DetailField
                    label="Destination Type"
                    value={ship.nav.route.destination.type}
                />
                <DetailField
                    label="Origin Coordinates"
                    value={`${ship.nav.route.origin.x}, ${ship.nav.route.origin.y}`}
                />
                <DetailField
                    label="Destination Coordinates"
                    value={`${ship.nav.route.destination.x}, ${ship.nav.route.destination.y}`}
                />
            </DetailBlock>

            <DetailBlock title="Crew">
                <DetailField label="Current" value={ship.crew.current} />
                <DetailField label="Required" value={ship.crew.required} />
                <DetailField label="Capacity" value={ship.crew.capacity} />
                <DetailField label="Rotation" value={ship.crew.rotation} />
                <DetailField label="Morale" value={ship.crew.morale} />
                <DetailField label="Wages" value={ship.crew.wages} />
            </DetailBlock>

            <DetailBlock title="Frame">
                <DetailField label="Name" value={ship.frame.name} />
                <DetailField label="Symbol" value={ship.frame.symbol} />
                <DetailField
                    label="Module Slots"
                    value={ship.frame.moduleSlots}
                />
                <DetailField
                    label="Mounting Points"
                    value={ship.frame.mountingPoints}
                />
                <DetailField
                    label="Fuel Capacity"
                    value={ship.frame.fuelCapacity}
                />
                <DetailField label="Condition" value={ship.frame.condition} />
                <DetailField label="Integrity" value={ship.frame.integrity} />
                <DetailField label="Quality" value={ship.frame.quality} />
                <DetailField
                    label="Requirements"
                    value={formatRequirements(ship.frame.requirements)}
                />
                <p className={styles.detailText}>{ship.frame.description}</p>
            </DetailBlock>

            <DetailBlock title="Reactor">
                <DetailField label="Name" value={ship.reactor.name} />
                <DetailField label="Symbol" value={ship.reactor.symbol} />
                <DetailField
                    label="Power Output"
                    value={ship.reactor.powerOutput}
                />
                <DetailField label="Condition" value={ship.reactor.condition} />
                <DetailField label="Integrity" value={ship.reactor.integrity} />
                <DetailField label="Quality" value={ship.reactor.quality} />
                <DetailField
                    label="Requirements"
                    value={formatRequirements(ship.reactor.requirements)}
                />
                <p className={styles.detailText}>{ship.reactor.description}</p>
            </DetailBlock>

            <DetailBlock title="Engine">
                <DetailField label="Name" value={ship.engine.name} />
                <DetailField label="Symbol" value={ship.engine.symbol} />
                <DetailField label="Speed" value={ship.engine.speed} />
                <DetailField label="Condition" value={ship.engine.condition} />
                <DetailField label="Integrity" value={ship.engine.integrity} />
                <DetailField label="Quality" value={ship.engine.quality} />
                <DetailField
                    label="Requirements"
                    value={formatRequirements(ship.engine.requirements)}
                />
                <p className={styles.detailText}>{ship.engine.description}</p>
            </DetailBlock>

            <DetailBlock title="Fuel & Cooldown">
                <DetailField label="Fuel Current" value={ship.fuel.current} />
                <DetailField label="Fuel Capacity" value={ship.fuel.capacity} />
                <DetailField
                    label="Last Fuel Use"
                    value={ship.fuel.consumed.amount}
                />
                <DetailField
                    label="Fuel Use Time"
                    value={formatDateTime(ship.fuel.consumed.timestamp)}
                />
                <DetailField
                    label="Cooldown Total"
                    value={`${ship.cooldown.totalSeconds}s`}
                />
                <DetailField
                    label="Cooldown Remaining"
                    value={`${ship.cooldown.remainingSeconds}s`}
                />
                <DetailField
                    label="Cooldown Expires"
                    value={formatDateTime(ship.cooldown.expiration)}
                />
            </DetailBlock>
        </div>
    );
};

export default ShipDetails;
