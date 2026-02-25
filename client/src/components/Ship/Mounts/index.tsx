import { formatRequirements } from "helpers/fleetFormatters";

import Card from "components/Common/Card";
import Container from "components/Common/Container";
import DetailsTable from "components/Ship/DetailsTable";

import type { Ship } from "types/fleet";

import styles from "./Mounts.module.css";

const ShipMounts = ({ ship }: { ship: Ship }) => {
    return (
        <Container className={styles.mountsGrid}>
            {ship.mounts.length > 0 ? (
                ship.mounts.map((mount) => (
                    <Card
                        title={mount.name}
                        subTitle={mount.symbol}
                        key={`${ship.symbol}-${mount.symbol}`}
                        cardLight
                    >
                        <DetailsTable
                            data={[
                                {
                                    label: "Strength",
                                    value: mount.strength.toString(),
                                },
                                {
                                    label: "Deposits",
                                    value:
                                        (mount.deposits?.length ?? 0) > 0
                                            ? (mount.deposits?.join(", ") ??
                                              "None")
                                            : "None",
                                },
                                {
                                    label: "Requirements",
                                    value: formatRequirements(
                                        mount.requirements,
                                    ),
                                },
                            ]}
                        />
                        <p className={styles.detailText}>{mount.description}</p>
                    </Card>
                ))
            ) : (
                <p className={styles.detailText}>No mounts installed.</p>
            )}
        </Container>
    );
};

export default ShipMounts;
