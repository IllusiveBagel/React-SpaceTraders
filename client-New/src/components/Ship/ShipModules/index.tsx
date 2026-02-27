import { displayValue, formatRequirements } from "helpers/fleetFormatters";

import Card from "components/Common/Card";
import DetailsTable from "components/Ship/DetailsTable";
import Container from "components/Common/Container";

import type { Ship, ShipModule } from "types/Ship";

import styles from "./Modules.module.css";

const ShipModules = ({ ship }: { ship: Ship }) => {
    return (
        <Container className={styles.modulesGrid}>
            {ship.modules.length > 0 ? (
                ship.modules.map((module: ShipModule) => (
                    <Card
                        title={module.name}
                        subTitle={module.symbol}
                        key={`${ship.symbol}-${module.symbol}`}
                        cardLight
                    >
                        <DetailsTable
                            data={[
                                {
                                    label: "Range",
                                    value: displayValue(module.range),
                                },
                                {
                                    label: "Capacity",
                                    value: displayValue(module.capacity),
                                },
                                {
                                    label: "Requirements",
                                    value: formatRequirements(
                                        module.requirements,
                                    ),
                                },
                            ]}
                        />
                        <p className={styles.detailText}>
                            {module.description}
                        </p>
                    </Card>
                ))
            ) : (
                <p className={styles.detailText}>No modules installed.</p>
            )}
        </Container>
    );
};

export default ShipModules;
