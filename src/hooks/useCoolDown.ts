import { useState, useRef, useCallback, useEffect } from "react";

export function useCooldown(initialSeconds: number = 5) {
    const [cooldown, setCooldown] = useState(0);
    const cooldownInterval = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        return () => {
            if (cooldownInterval.current) {
                clearInterval(cooldownInterval.current);
            }
        };
    }, []);

    const startCooldown = useCallback(() => {
        setCooldown(initialSeconds);

        if (cooldownInterval.current) {
            clearInterval(cooldownInterval.current);
        }

        cooldownInterval.current = setInterval(() => {
            setCooldown((prev) => {
                if (prev <= 1) {
                    if (cooldownInterval.current) {
                        clearInterval(cooldownInterval.current);
                        cooldownInterval.current = null;
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [initialSeconds]);

    const resetCooldown = useCallback(() => {
        setCooldown(0);
        if (cooldownInterval.current) {
            clearInterval(cooldownInterval.current);
            cooldownInterval.current = null;
        }
    }, []);

    return {
        cooldown,
        startCooldown,
        resetCooldown,
        isOnCooldown: cooldown > 0
    };
}