import type { SystemType } from "./";

export type ScannedSystem = {
    symbol: string;
    sectorSymbol: string;
    systemType: SystemType;
    x: number;
    y: number;
    distance: number;
};
