import type { SurveyDeposit, SurveySize } from "./";

export type Survey = {
    signature: string;
    symbol: string;
    deposits: SurveyDeposit[];
    expiration: string;
    size: SurveySize;
};
