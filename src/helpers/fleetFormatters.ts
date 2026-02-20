type Requirements = {
    power?: number;
    crew?: number;
    slots?: number;
};

const formatPercent = (current: number, capacity: number) => {
    if (capacity <= 0) {
        return "0%";
    }

    return `${Math.round((current / capacity) * 100)}%`;
};

const formatDateTime = (value: string) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Unknown";
    }

    return date.toLocaleString();
};

const displayValue = (value: string | number | undefined | null) => {
    if (value === undefined || value === null || value === "") {
        return "N/A";
    }

    return String(value);
};

const formatDuration = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds <= 0) {
        return "0s";
    }

    const rounded = Math.max(0, Math.round(seconds));
    const hours = Math.floor(rounded / 3600);
    const minutes = Math.floor((rounded % 3600) / 60);
    const remainingSeconds = rounded % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m ${remainingSeconds}s`;
    }

    if (minutes > 0) {
        return `${minutes}m ${remainingSeconds}s`;
    }

    return `${remainingSeconds}s`;
};

const formatRequirements = (requirements?: Requirements) => {
    return `Power ${displayValue(requirements?.power)} • Crew ${displayValue(requirements?.crew)} • Slots ${displayValue(requirements?.slots)}`;
};

export {
    displayValue,
    formatDateTime,
    formatDuration,
    formatPercent,
    formatRequirements,
};
