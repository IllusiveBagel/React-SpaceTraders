import type { ShipNavFlightMode, ShipNavRoute, ShipNavStatus } from "./";

export type ShipNav = {
    systemSymbol: string;
    waypointSymbol: string;
    route: ShipNavRoute;
    status: ShipNavStatus;
    flightMode: ShipNavFlightMode;
};
