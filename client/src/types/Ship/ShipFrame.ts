import type { Requirements } from "../Common";

export type ShipFrame = {
    symbol: ShipFrameSymbol;
    name: string;
    condition: number;
    integrity: number;
    description: string;
    moduleSlots: number;
    mountingPoints: number;
    fuelCapacity: number;
    requirements: Requirements;
    quality: number;
};

type ShipFrameSymbol =
    | "FRAME_PROBE"
    | "FRAME_DRONE"
    | "FRAME_INTERCEPTOR"
    | "FRAME_RACER"
    | "FRAME_FIGHTER";
