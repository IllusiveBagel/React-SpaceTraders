export type ShipCrew = {
    current: number;
    required: number;
    capacity: number;
    rotation: ShipCrewRotation;
    morale: number;
    wages: number;
};

type ShipCrewRotation = "STRICT" | "RELAXED";
