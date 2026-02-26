import type { WaypointType } from "./WaypointType";
import type { WaypointOrbital } from "./WaypointOrbital";
import type { FactionSymbol } from "../Faction/FactionSymbol";
import type { WaypointTrait } from "./WaypointTrait";
import type { WaypointModifier } from "./WaypointModifier";
import type { Chart } from "../Common";

export type Waypoint = {
    symbol: string;
    type: WaypointType;
    systemSymbol: string;
    x: number;
    y: number;
    orbitals: WaypointOrbital[];
    orbits: string | undefined;
    faction: { symbol: FactionSymbol };
    traits: WaypointTrait[];
    modifiers: WaypointModifier[];
    chart: Chart;
    isUnderConstruction: boolean;
};
