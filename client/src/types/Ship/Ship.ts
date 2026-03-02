import type {
    ShipRegistration,
    ShipNav,
    ShipCrew,
    ShipFrame,
    ShipReactor,
    ShipEngine,
    ShipModule,
    ShipMount,
    ShipCargo,
    ShipFuel,
} from "./";
import type { Cooldown } from "../Cooldown";

export type Ship = {
    symbol: string;
    registration: ShipRegistration;
    nav: ShipNav;
    crew: ShipCrew;
    frame: ShipFrame;
    reactor: ShipReactor;
    engine: ShipEngine;
    modules: ShipModule[];
    mounts: ShipMount[];
    cargo: ShipCargo;
    fuel: ShipFuel;
    cooldown: Cooldown;
};
