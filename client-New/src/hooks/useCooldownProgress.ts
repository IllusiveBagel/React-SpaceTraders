import { useEffect, useMemo, useState } from "react";

import { useQueryShip } from "./Ship";

type CooldownProgress = {
    isCoolingDown: boolean;
    totalSeconds: number;
    elapsedSeconds: number;
    remainingSeconds: number;
    progressPercent: number;
    refetchCooldown: () => void;
    readyTime: string | null;
};

const useCooldownProgress = (shipSymbol?: string): CooldownProgress => {
    const { useShipCooldownQuery } = useQueryShip(shipSymbol);
    const { data: cooldownData, refetch } = useShipCooldownQuery();
    const [now, setNow] = useState(() => Date.now());

    const refetchCooldown = () => {
        refetch();
    };

    const timings = useMemo(() => {
        if (!cooldownData) {
            return null;
        }

        const totalSeconds =
            cooldownData?.totalSeconds || cooldownData?.remainingSeconds || 0;
        const parsedEnd = Date.parse(cooldownData?.expiration || "");
        const end = Number.isNaN(parsedEnd)
            ? Date.now() + (cooldownData?.remainingSeconds || 0) * 1000
            : parsedEnd;

        if (totalSeconds <= 0) {
            return null;
        }

        const start = end - totalSeconds * 1000;

        if (end <= start) {
            return null;
        }

        return { start, end };
    }, [cooldownData]);

    const isCoolingDown = Boolean(
        cooldownData && cooldownData?.remainingSeconds > 0 && timings,
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

    if (!timings || !cooldownData) {
        return {
            isCoolingDown: false,
            totalSeconds: 0,
            elapsedSeconds: 0,
            remainingSeconds: 0,
            progressPercent: 0,
            readyTime: null,
            refetchCooldown,
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
        refetchCooldown,
    };
};

export default useCooldownProgress;
