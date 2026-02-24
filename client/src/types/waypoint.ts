type WaypointTrait = {
    symbol: string;
    name: string;
    description: string;
};

type WaypointModifier = {
    symbol: string;
    name: string;
    description: string;
};

type WaypointOrbital = {
    symbol: string;
};

type WaypointFaction = {
    symbol: string;
};

type WaypointChart = {
    waypointSymbol: string;
    submittedBy: string;
    submittedOn: string;
};

type Waypoint = {
    symbol: string;
    type: string;
    systemSymbol: string;
    x: number;
    y: number;
    orbitals: WaypointOrbital[];
    orbits?: string | null;
    traits?: WaypointTrait[];
    modifiers?: WaypointModifier[];
    faction?: WaypointFaction | null;
    chart?: WaypointChart | null;
    isUnderConstruction?: boolean;
};

export type {
    Waypoint,
    WaypointChart,
    WaypointFaction,
    WaypointModifier,
    WaypointOrbital,
    WaypointTrait,
};
