import type { Ship } from "types/Ship";

import styles from "./ShipDetails.module.css";
import { formatDateTime, formatRequirements } from "helpers/fleetFormatters";
import Card from "components/Common/Card";
import DetailsTable from "../DetailsTable";
import Container from "components/Common/Container";

type ShipDetailsProps = {
    ship: Ship;
};

const ShipDetails = ({ ship }: ShipDetailsProps) => {
    return (
        <Container className={styles.detailsGrid}>
            <Card title="Navigation" cardLight>
                <DetailsTable
                    data={[
                        { label: "Status", value: ship.nav.status },
                        { label: "Flight Mode", value: ship.nav.flightMode },
                        { label: "System", value: ship.nav.systemSymbol },
                        { label: "Waypoint", value: ship.nav.waypointSymbol },
                        {
                            label: "Route",
                            value: `${ship.nav.route.origin.symbol} → ${ship.nav.route.destination.symbol}`,
                        },
                        {
                            label: "Arrival",
                            value: formatDateTime(ship.nav.route.arrival),
                        },
                        {
                            label: "Departure",
                            value: formatDateTime(ship.nav.route.departureTime),
                        },
                        {
                            label: "Origin",
                            value: `${ship.nav.route.origin.x}, ${ship.nav.route.origin.y}`,
                        },
                        {
                            label: "Origin Type",
                            value: ship.nav.route.origin.type,
                        },
                        {
                            label: "Destination",
                            value: `${ship.nav.route.destination.x}, ${ship.nav.route.destination.y}`,
                        },
                        {
                            label: "Destination Type",
                            value: ship.nav.route.destination.type,
                        },
                    ]}
                />
            </Card>

            <Card title="Frame" cardLight>
                <DetailsTable
                    data={[
                        { label: "Name", value: ship.frame.name },
                        { label: "Symbol", value: ship.frame.symbol },
                        {
                            label: "Module Slots",
                            value: ship.frame.moduleSlots,
                        },
                        {
                            label: "Mounting Points",
                            value: ship.frame.mountingPoints,
                        },
                        {
                            label: "Fuel Capacity",
                            value: ship.frame.fuelCapacity,
                        },
                        { label: "Condition", value: ship.frame.condition },
                        { label: "Integrity", value: ship.frame.integrity },
                        { label: "Quality", value: ship.frame.quality },
                        {
                            label: "Requirements",
                            value: formatRequirements(ship.frame.requirements),
                        },
                    ]}
                />
                <p className={styles.detailText}>{ship.frame.description}</p>
            </Card>

            <Card title="Engine" cardLight>
                <DetailsTable
                    data={[
                        { label: "Name", value: ship.engine.name },
                        { label: "Symbol", value: ship.engine.symbol },
                        { label: "Speed", value: ship.engine.speed },
                        { label: "Condition", value: ship.engine.condition },
                        { label: "Integrity", value: ship.engine.integrity },
                        { label: "Quality", value: ship.engine.quality },
                        {
                            label: "Requirements",
                            value: formatRequirements(ship.engine.requirements),
                        },
                    ]}
                />
                <p className={styles.detailText}>{ship.engine.description}</p>
            </Card>

            <Card title="Reactor" cardLight>
                <DetailsTable
                    data={[
                        { label: "Name", value: ship.reactor.name },
                        { label: "Symbol", value: ship.reactor.symbol },
                        {
                            label: "Power Output",
                            value: ship.reactor.powerOutput,
                        },
                        { label: "Condition", value: ship.reactor.condition },
                        { label: "Integrity", value: ship.reactor.integrity },
                        { label: "Quality", value: ship.reactor.quality },
                        {
                            label: "Requirements",
                            value: formatRequirements(
                                ship.reactor.requirements,
                            ),
                        },
                    ]}
                />
                <p className={styles.detailText}>{ship.reactor.description}</p>
            </Card>

            <Card title="Fuel & Cooldown" cardLight>
                <DetailsTable
                    data={[
                        { label: "Fuel Current", value: ship.fuel.current },
                        { label: "Fuel Capacity", value: ship.fuel.capacity },
                        {
                            label: "Last Fuel Use",
                            value: ship.fuel.consumed.amount,
                        },
                        {
                            label: "Fuel Use Time",
                            value: formatDateTime(ship.fuel.consumed.timestamp),
                        },
                        {
                            label: "Cooldown Total",
                            value: `${ship.cooldown.totalSeconds}s`,
                        },
                        {
                            label: "Cooldown Remaining",
                            value: `${ship.cooldown.remainingSeconds}s`,
                        },
                        {
                            label: "Cooldown Expires",
                            value: formatDateTime(ship.cooldown.expiration),
                        },
                    ]}
                />
            </Card>

            <Card title="Crew" cardLight>
                <DetailsTable
                    data={[
                        { label: "Current", value: ship.crew.current },
                        { label: "Required", value: ship.crew.required },
                        { label: "Capacity", value: ship.crew.capacity },
                        { label: "Rotation", value: ship.crew.rotation },
                        { label: "Morale", value: ship.crew.morale },
                        { label: "Wages", value: ship.crew.wages },
                    ]}
                />
            </Card>
        </Container>
    );
};

export default ShipDetails;
