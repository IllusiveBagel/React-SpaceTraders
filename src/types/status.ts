type ServerStatusStats = {
    accounts?: number;
    agents?: number;
    ships?: number;
    systems?: number;
    waypoints?: number;
};

type ServerStatusHealth = {
    lastMarketUpdate?: string;
};

type LeaderboardCredits = {
    agentSymbol?: string;
    credits?: number;
};

type LeaderboardCharts = {
    agentSymbol?: string;
    chartCount?: number;
};

type ServerStatusLeaderboards = {
    mostCredits?: LeaderboardCredits[];
    mostSubmittedCharts?: LeaderboardCharts[];
};

type ServerStatusResets = {
    next?: string;
    frequency?: string;
};

type ServerStatusAnnouncement = {
    title?: string;
    body?: string;
};

type ServerStatusLink = {
    name?: string;
    url?: string;
};

export type ServerStatus = {
    status?: string;
    version?: string;
    resetDate?: string;
    description?: string;
    stats?: ServerStatusStats;
    health?: ServerStatusHealth;
    leaderboards?: ServerStatusLeaderboards;
    serverResets?: ServerStatusResets;
    announcements?: ServerStatusAnnouncement[];
    links?: ServerStatusLink[];
};
