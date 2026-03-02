import type { WaypointType } from "../Waypoint";

export type ShipNavRouteWaypoint = {
    symbol: string;
    type: WaypointType;
    x: number;
    y: number;
};
