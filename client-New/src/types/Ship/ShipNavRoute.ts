import type { ShipNavRouteWaypoint } from "./";

export type ShipNavRoute = {
    destinations: ShipNavRouteWaypoint;
    origin: ShipNavRouteWaypoint;
    departureTime: string;
    arrival: string;
};
