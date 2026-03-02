import type { SystemType, SystemWaypoint, SystemFaction } from "types/System";

export type System = {
    constellation: string;
    symbol: string;
    sectorSymbol: string;
    type: SystemType;
    x: number;
    y: number;
    waypoints: SystemWaypoint[];
    factions: SystemFaction[];
    name: string;
};
