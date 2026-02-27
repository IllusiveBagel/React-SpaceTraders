import type { ShipNavRouteWaypoint } from "./";

export type ShipNavRoute = {
    destination: ShipNavRouteWaypoint;
    origin: ShipNavRouteWaypoint;
    departureTime: string;
    arrival: string;
};
