import type { WaypointOrbital, WaypointTrait, WaypointType } from "./";
import type { FactionSymbol } from "../Faction";
import type { Chart } from "../Common";

export type ScannedWaypoint = {
    symbol: string;
    type: WaypointType;
    systemSymbol: string;
    x: number;
    y: number;
    orbitals: WaypointOrbital[];
    faction: { symbol: FactionSymbol };
    traits: WaypointTrait[];
    chart: Chart;
};
