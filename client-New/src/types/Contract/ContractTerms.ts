import type { ContractDeliverGood, ContractPayment } from "./";

export type ContractTerms = {
    deadline: string;
    payment: ContractPayment;
    deliver: ContractDeliverGood[];
};
