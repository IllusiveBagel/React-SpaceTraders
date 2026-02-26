import type { ShipCargoItem } from "./";

export type ShipCargo = {
    capacity: number;
    units: number;
    inventory: ShipCargoItem[];
};
