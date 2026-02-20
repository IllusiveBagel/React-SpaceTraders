type System = {
    constellation: string;
    symbol: string;
    sectorSymbol: string;
    type: string;
    x: number;
    y: number;
    waypoints: Waypoint[];
    factions: Faction[];
    name: string;
};

type Waypoint = {
    symbol: string;
    type: string;
    x: number;
    y: number;
    orbitals: Orbital[];
    orbits: string;
};

type Orbital = {
    symbol: string;
};

type Faction = {
    symbol: string;
};

export type { System, Waypoint, Orbital, Faction };
