export type ShipRegistration = {
    name: string;
    factionSymbol: string;
    role: ShipRole;
};

type ShipRole =
    | "FABRICATOR"
    | "HARVESTER"
    | "HAULER"
    | "INTERCEPTOR"
    | "EXCAVATOR"
    | "TRANSPORT"
    | "REPAIR"
    | "SURVEYOR"
    | "COMMAND"
    | "CARRIER"
    | "PATROL"
    | "SATELLITE"
    | "EXPLORER"
    | "REFINERY";
