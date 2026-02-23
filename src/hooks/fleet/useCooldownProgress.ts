import { useEffect, useMemo, useState } from "react";

import type { Ship } from "types/fleet";

type CooldownProgress = {
    isCoolingDown: boolean;
    totalSeconds: number;
    elapsedSeconds: number;
    remainingSeconds: number;
    progressPercent: number;
    readyTime: string | null;
};

const useCooldownProgress = (ship?: Ship): CooldownProgress => {
    const [now, setNow] = useState(() => Date.now());

    const timings = useMemo(() => {
        if (!ship) {
            return null;
        }

        const totalSeconds =
            ship.cooldown.totalSeconds || ship.cooldown.remainingSeconds || 0;
        const parsedEnd = Date.parse(ship.cooldown.expiration);
        const end = Number.isNaN(parsedEnd)
            ? Date.now() + ship.cooldown.remainingSeconds * 1000
            : parsedEnd;

        if (totalSeconds <= 0) {
            return null;
        }

        const start = end - totalSeconds * 1000;

        if (end <= start) {
            return null;
        }

        return { start, end };
    }, [ship]);

    const isCoolingDown = Boolean(
        ship && ship.cooldown.remainingSeconds > 0 && timings,
    );

    useEffect(() => {
        if (!isCoolingDown) {
            return;
        }

        const timer = window.setInterval(() => {
            setNow(Date.now());
        }, 1000);

        return () => window.clearInterval(timer);
    }, [isCoolingDown]);

    if (!timings || !ship) {
        return {
            isCoolingDown: false,
            totalSeconds: 0,
            elapsedSeconds: 0,
            remainingSeconds: 0,
            progressPercent: 0,
            readyTime: null,
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
    const readyTime = new Date(timings.end).toLocaleTimeString();

    return {
        isCoolingDown,
        totalSeconds,
        elapsedSeconds,
        remainingSeconds,
        progressPercent,
        readyTime,
    };
};

export default useCooldownProgress;
