import type { ShipRegistration } from "./ShipRegistration";
import type { ShipNav } from "./ShipNav";
import type { ShipCrew } from "./ShipCrew";
import type { ShipFrame } from "./ShipFrame";
import type { ShipReactor } from "./ShipReactor";
import type { ShipEngine } from "./ShipEngine";
import type { ShipModule } from "./ShipModule";
import type { ShipMount } from "./ShipMount";
import type { ShipCargo } from "./ShipCargo";
import type { ShipFuel } from "./ShipFuel";
import type { Cooldown } from "../Cooldown/Cooldown";

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
