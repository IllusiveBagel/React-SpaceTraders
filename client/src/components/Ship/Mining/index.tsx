import useShipActions from "hooks/fleet/useShipActions";
import useGetMiningWaypoints from "hooks/systems/useGetMiningWaypoints";

import Card from "components/Common/Card";

import type { Ship } from "types/fleet";
import type { Survey } from "types/survey";

import styles from "./Mining.module.css";

type MiningProps = {
    ship: Ship;
    shipSymbol: string;
    handleAction: (
        action: () => Promise<unknown>,
        message: string,
    ) => Promise<void>;
    surveys: Survey[];
    setSurveys: (surveys: Survey[]) => void;
    survey: Survey | null;
    setSurvey: (survey: Survey | null) => void;
};

const Mining = ({
    ship,
    shipSymbol,
    handleAction,
    surveys,
    setSurveys,
    survey,
    setSurvey,
}: MiningProps) => {
    const { extract, createSurvey, extractWithSurvey, isWorking } =
        useShipActions(shipSymbol);

    const { data: miningWaypoints = [] } = useGetMiningWaypoints(
        ship?.nav.systemSymbol,
    );

    const isInOrbit = ship?.nav.status === "IN_ORBIT";

    const isAtMiningWaypoint = Boolean(
        isInOrbit &&
        ship?.nav.waypointSymbol &&
        miningWaypoints.some(
            (waypoint) => waypoint.symbol === ship.nav.waypointSymbol,
        ),
    );

    const isOnCooldown = Boolean(ship && ship.cooldown.remainingSeconds > 0);

    return (
        <Card title="Mining" cardLight>
            <div className={styles.controlRow}>
                <select
                    value={survey?.signature || ""}
                    onChange={(e) =>
                        setSurvey(
                            surveys.find(
                                (s) => s.signature === e.target.value,
                            ) || null,
                        )
                    }
                >
                    {surveys?.length <= 0 ? (
                        <option value="" disabled>
                            No surveys available
                        </option>
                    ) : (
                        surveys?.map((survey) => (
                            <option
                                key={survey.signature}
                                value={survey.signature}
                            >
                                <h1>{survey.symbol}</h1>
                                <ul>
                                    {survey.deposits.map((d) => (
                                        <li key={d.symbol}>{d.symbol}</li>
                                    ))}
                                </ul>
                            </option>
                        ))
                    )}
                </select>
                <button
                    type="button"
                    onClick={() =>
                        handleAction(async () => {
                            setSurveys(await createSurvey());
                            setSurvey(surveys[0] || null);
                        }, "Creating survey.")
                    }
                    disabled={isWorking || !isAtMiningWaypoint || isOnCooldown}
                >
                    Survey
                </button>
                <button
                    type="button"
                    onClick={() =>
                        handleAction(
                            () => extractWithSurvey(survey),
                            "Extracting resources.",
                        )
                    }
                    disabled={isWorking || !isAtMiningWaypoint || isOnCooldown}
                >
                    Extract
                </button>
            </div>
            <div className={styles.controlRow}>
                <button
                    type="button"
                    onClick={() =>
                        handleAction(() => extract(), "Extracting resources.")
                    }
                    disabled={isWorking || !isAtMiningWaypoint || isOnCooldown}
                >
                    Extract
                </button>
            </div>
            <p className={styles.controlHint}>
                {!isAtMiningWaypoint
                    ? "Must be in orbit at a minable waypoint."
                    : isOnCooldown
                      ? `Cooldown: ${ship.cooldown.remainingSeconds}s`
                      : "Ready to extract."}
            </p>
        </Card>
    );
};

export default Mining;
