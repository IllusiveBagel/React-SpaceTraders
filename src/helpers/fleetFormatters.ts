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

const formatRequirements = (requirements?: Requirements) => {
    return `Power ${displayValue(requirements?.power)} • Crew ${displayValue(requirements?.crew)} • Slots ${displayValue(requirements?.slots)}`;
};

export { displayValue, formatDateTime, formatPercent, formatRequirements };
