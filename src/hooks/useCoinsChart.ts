import type { HistoricDataPoint } from "@/types/CoinChart";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    type ChartOptions
} from 'chart.js';

ChartJS.register
    (
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        Title,
        Tooltip,
        Legend,
        Filler,

    );

export function useCoinChart(coinId: string | undefined) {
    const lastFetched = useRef<{ id: string, tf: string, time: number } | null>(null);
    const [historicData, setHistoricData] = useState<HistoricDataPoint[]>([]);
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
                const formattedData = data.prices.map((item: number[]) => ({
                    time: item[0],
                    price: item[1]
                }));
                setHistoricData(formattedData);
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

    const isPriceUp = (historicData.at(-1)?.price ?? 0) > (historicData[0]?.price ?? 0);

    const themeColor = isPriceUp ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)';

    const chartData = useMemo(() => {
        return {
            labels: historicData.map((dataPoint) => {
                const date = new Date(dataPoint.time);
                if (timeFrame === "1") {
                    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                }
                return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
            }),
            datasets: [
                {
                    data: historicData.map((dataPoint) => dataPoint.price),
                    borderColor: themeColor,
                    backgroundColor: isPriceUp ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    borderWidth: 2,
                },
            ],
        };
    }, [historicData, timeFrame, themeColor, isPriceUp]);

    const options: ChartOptions<'line'> = useMemo(() => {

        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    padding: 12,
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        maxRotation: 0,
                        autoSkip: true,
                        maxTicksLimit: 8,
                        color: '#94a3b8',
                    },
                },
                y: {
                    grid: {
                        color: 'rgba(148, 163, 184, 0.1)',
                    },
                    ticks: {
                        callback: (value: any) => `$${value.toLocaleString()}`,
                        color: '#94a3b8',
                    },
                },
            },
        }
    }, []);

    return { historicData, loading, timeFrame, isPriceUp, themeColor, chartData, options, setTimeFrame };
}