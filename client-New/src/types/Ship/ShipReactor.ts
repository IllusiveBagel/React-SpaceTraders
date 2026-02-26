import type { Requirements } from "../Common";

export type ShipReactor = {
    symbol: ShipReactorSymbol;
    name: string;
    condition: number;
    integrity: number;
    description: string;
    powerOutput: number;
    requirements: Requirements;
    quality: number;
};

type ShipReactorSymbol =
    | "REACTOR_SOLAR_I"
    | "REACTOR_FUSION_I"
    | "REACTOR_FISSION_I"
    | "REACTOR_CHEMICAL_I"
    | "REACTOR_ANTIMATTER_I";
