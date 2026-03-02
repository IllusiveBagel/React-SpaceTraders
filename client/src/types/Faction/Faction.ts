import type { FactionSymbol, FactionTrait } from "types/Faction";

export type Faction = {
    symbol: FactionSymbol;
    name: string;
    description: string;
    headquarters: string;
    traits: FactionTrait[];
    isRecruiting: boolean;
};
