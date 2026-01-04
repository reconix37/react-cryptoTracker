import { useEffect, useState } from "react";

export function useCoinCharts(coinId: string | undefined) {
    const [historicData, setHistoricData] = useState<number[][]>([]);
    const [loading, setLoading] = useState(true);
    const [timeFrame, setTimeFrame] = useState("7");

    const fetchHistoricData = async (id: string) => {
        if (!coinId) return;

        try {
            setLoading(true);
            const response = await fetch(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${timeFrame}`);
            const data = await response.json();
            setHistoricData(data.prices);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching historic data:", error);
            setLoading(false);
        }
    }

    useEffect(() => {
        if (coinId) {
            fetchHistoricData(coinId);
        }
    }, [coinId, timeFrame]);

    return { historicData, loading, timeFrame, setTimeFrame };
}