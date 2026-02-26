import type {
    ShipEngine,
    ShipFrame,
    ShipMount,
    ShipNav,
    ShipReactor,
    ShipRegistration,
} from "./";

export type ScannedShip = {
    symbol: string;
    registration: ShipRegistration;
    nav: ShipNav;
    frame: ShipFrame;
    reactor: ShipReactor;
    engine: ShipEngine;
    mounts: ShipMount[];
};
