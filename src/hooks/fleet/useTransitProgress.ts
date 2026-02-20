import { useEffect, useMemo, useState } from "react";

import type { Ship } from "types/fleet";

type TransitProgress = {
    isInTransit: boolean;
    totalSeconds: number;
    elapsedSeconds: number;
    remainingSeconds: number;
    progressPercent: number;
    arrivalTime: string | null;
};

const useTransitProgress = (ship?: Ship): TransitProgress => {
    const [now, setNow] = useState(() => Date.now());

    const timings = useMemo(() => {
        if (!ship) {
            return null;
        }

        const start = Date.parse(ship.nav.route.departureTime);
        const end = Date.parse(ship.nav.route.arrival);

        if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
            return null;
        }

        return { start, end };
    }, [ship]);

    const isInTransit = Boolean(
        ship && ship.nav.status === "IN_TRANSIT" && timings,
    );

    useEffect(() => {
        if (!isInTransit) {
            return;
        }

        const timer = window.setInterval(() => {
            setNow(Date.now());
        }, 1000);

        return () => window.clearInterval(timer);
    }, [isInTransit]);

    if (!timings || !ship) {
        return {
            isInTransit: false,
            totalSeconds: 0,
            elapsedSeconds: 0,
            remainingSeconds: 0,
            progressPercent: 0,
            arrivalTime: null,
        };
    }

    const totalSeconds = Math.max(
        1,
        Math.round((timings.end - timings.start) / 1000),
    );
    const elapsedSeconds = Math.min(
        totalSeconds,
        Math.max(0, Math.round((now - timings.start) / 1000)),
    );
    const remainingSeconds = Math.max(
        0,
        Math.round((timings.end - now) / 1000),
    );
    const progressPercent = Math.min(
        100,
        Math.max(0, Math.round((elapsedSeconds / totalSeconds) * 100)),
    );
    const arrivalTime = new Date(timings.end).toLocaleTimeString();

    return {
        isInTransit,
        totalSeconds,
        elapsedSeconds,
        remainingSeconds,
        progressPercent,
        arrivalTime,
    };
};

export default useTransitProgress;
