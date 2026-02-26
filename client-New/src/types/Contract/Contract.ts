import type { FactionSymbol } from "../Faction";
import type { ContractTerms } from "./";

export type Contract = {
    id: string;
    factionSymbol: FactionSymbol;
    type: ContractType;
    terms: ContractTerms;
    accepted: boolean;
    fulfilled: boolean;
    deadlineToAccept: string;
};

type ContractType = "PROCUREMENT" | "TRANSPORT" | "SHUTTLE";
