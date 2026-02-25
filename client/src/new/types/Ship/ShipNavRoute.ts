import type { ShipNavRouteWaypoint } from "./ShipNavRouteWaypoint";

export type ShipNavRoute = {
    destinations: ShipNavRouteWaypoint;
    origin: ShipNavRouteWaypoint;
    departureTime: string;
    arrival: string;
};
