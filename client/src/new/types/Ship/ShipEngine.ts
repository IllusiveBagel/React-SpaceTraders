import type { Requirements } from "../Common/Requirements";

export type ShipEngine = {
    symbol: ShipEngineSymbol;
    name: string;
    condition: number;
    integrity: number;
    description: string;
    speed: number;
    requirements: Requirements;
    quality: number;
};

type ShipEngineSymbol =
    | "ENGINE_IMPULSE_DRIVE_I"
    | "ENGINE_ION_DRIVE_I"
    | "ENGINE_ION_DRIVE_II"
    | "ENGINE_HYPER_DRIVE_I";
