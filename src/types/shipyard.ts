type ShipyardShipType = {
    type: string;
};

type ShipyardTransaction = {
    waypointSymbol: string;
    shipSymbol: string;
    shipType: string;
    action: string;
    price: number;
    timestamp: string;
};

type ShipyardRequirement = {
    power?: number;
    crew?: number;
    slots?: number;
};

type ShipyardFrame = {
    symbol: string;
    name: string;
    description?: string;
    moduleSlots?: number;
    mountingPoints?: number;
    fuelCapacity?: number;
    requirements?: ShipyardRequirement;
};

type ShipyardReactor = {
    symbol: string;
    name: string;
    description?: string;
    powerOutput?: number;
    requirements?: ShipyardRequirement;
};

type ShipyardEngine = {
    symbol: string;
    name: string;
    description?: string;
    speed?: number;
    requirements?: ShipyardRequirement;
};

type ShipyardModule = {
    symbol: string;
    name: string;
    description?: string;
    requirements?: ShipyardRequirement;
};

type ShipyardMount = {
    symbol: string;
    name: string;
    description?: string;
    requirements?: ShipyardRequirement;
};

type ShipyardCrew = {
    required?: number;
    capacity?: number;
};

type ShipyardShip = {
    type: string;
    name?: string;
    description?: string;
    purchasePrice?: number;
    frame?: ShipyardFrame;
    reactor?: ShipyardReactor;
    engine?: ShipyardEngine;
    modules?: ShipyardModule[];
    mounts?: ShipyardMount[];
    crew?: ShipyardCrew;
};

type Shipyard = {
    symbol: string;
    shipTypes?: ShipyardShipType[];
    transactions?: ShipyardTransaction[];
    ships?: ShipyardShip[];
};

export type {
    Shipyard,
    ShipyardCrew,
    ShipyardEngine,
    ShipyardFrame,
    ShipyardModule,
    ShipyardMount,
    ShipyardReactor,
    ShipyardRequirement,
    ShipyardShip,
    ShipyardShipType,
    ShipyardTransaction,
};
