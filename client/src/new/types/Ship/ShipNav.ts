import type { ShipNavRoute } from "./ShipNavRoute";

export type ShipNav = {
    systemSymbol: string;
    waypointSymbol: string;
    route: ShipNavRoute;
    status: ShipNavStatus;
    flightMode: ShipFlightMode;
};

type ShipNavStatus = "IN_TRANSIT" | "IN_ORBIT" | "DOCKED";

type ShipFlightMode = "DRIFT" | "STEALTH" | "CRUISE" | "BURN";
