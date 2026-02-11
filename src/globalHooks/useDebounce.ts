import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, timeoutMs: number): T {
    const [debouncValue, setDebouncedValue] = useState<T>(value)

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, timeoutMs);

        return () => {
            clearTimeout(timer);
        };
    }, [value, timeoutMs]);

    return debouncValue
}