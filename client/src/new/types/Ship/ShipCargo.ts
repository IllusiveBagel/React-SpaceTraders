import type { ShipCargoItem } from "./ShipCargoItem";

export type ShipCargo = {
    capacity: number;
    units: number;
    inventory: ShipCargoItem[];
};
