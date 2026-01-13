import { useEffect, useRef, useState, useCallback } from "react";

export function useCoinCharts(coinId: string | undefined) {
    const lastFetched = useRef<{ id: string, tf: string, time: number } | null>(null);
    const [historicData, setHistoricData] = useState<number[][]>([]);
    const [loading, setLoading] = useState(true);
    const [timeFrame, setTimeFrame] = useState("7");

    const fetchHistoricData = useCallback(async (id: string) => {
        if (!id) return;

        const now = Date.now();
        if (lastFetched.current?.id === id &&
            lastFetched.current?.tf === timeFrame &&
            now - lastFetched.current.time < 60000) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(
                `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${timeFrame}`
            );

            if (!response.ok) throw new Error(`Status: ${response.status}`);

            const data = await response.json();

            if (data.prices) {
                setHistoricData(data.prices);
                lastFetched.current = { id, tf: timeFrame, time: now };
            }
        } catch (error) {
            console.error("Error fetching historic data:", error);
        } finally {
            setLoading(false);
        }
    }, [timeFrame]); 

    useEffect(() => {
        if (coinId) {
            fetchHistoricData(coinId);
        }
    }, [coinId, fetchHistoricData]);

    return { historicData, loading, timeFrame, setTimeFrame };
}