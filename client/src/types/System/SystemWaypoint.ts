import type { WaypointOrbital, WaypointType } from "types/Waypoint";

export type SystemWaypoint = {
    symbol: string;
    type: WaypointType;
    x: number;
    y: number;
    orbitals: WaypointOrbital[];
    orbits: string | null;
};
