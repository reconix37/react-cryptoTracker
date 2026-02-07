import { useState, useEffect, useCallback } from "react";

export function useCooldown(seconds: number = 5) {
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        if (timeLeft <= 0) return;

        const interval = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [timeLeft]);

    const startCooldown = useCallback(() => setTimeLeft(seconds), [seconds]);

    return {
        cooldown: timeLeft,
        isOnCooldown: timeLeft > 0,
        startCooldown,
    };
}