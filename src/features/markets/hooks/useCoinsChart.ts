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
import { useCrypto } from "@/providers/CryptoProvider";
import { fetchCoinGecko } from "@/services/api";
import type { MarketChartResponse } from "@/types/MarketChartResponse";
import type { ChartError } from "@/types/ChartError";
import { MARKET_CONFIG } from "@/configs/constants";

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

    const [historicData, setHistoricData] = useState<HistoricDataPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeFrame, setTimeFrame] = useState("7");
    const [error, setError] = useState<ChartError>(null);

    const abortRef = useRef<AbortController | null>(null);
    const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isMounted = useRef(true);

    const {
        executeRequest,
    } = useCrypto()


    const fetchHistoricData = useCallback(async () => {
        if (!coinId) return;

        setLoading(true);
        setError(null);

        abortRef.current?.abort();
        retryTimeoutRef.current && clearTimeout(retryTimeoutRef.current);

        const controller = new AbortController();
        abortRef.current = controller;


        const result = await executeRequest<MarketChartResponse>(() =>
            fetchCoinGecko(
                `coins/${coinId}/market_chart`,
                {
                    vs_currency: MARKET_CONFIG.DEFAULT_CURRENCY,
                    days: timeFrame,
                },
                controller.signal
            )
        );

        if (!isMounted.current) return;

        if (result.status === "success") {
            setHistoricData(
                result.data.prices.map(([time, price]) => ({ time, price }))
            );
            setLoading(false);
            return;
        }

        if (result.status === "rate_limit") {
            setError({ type: "rate_limit", retryAfter: result.retryAfter });

            retryTimeoutRef.current = setTimeout(() => {
                if (isMounted.current) fetchHistoricData();
            }, result.retryAfter * 1000);

            return;
        }

        if (result.status === "aborted") {

            return;
        }

        if (result.status === "error") {
            setError({ type: "network" });
            setLoading(false);
        }
    }, [coinId, timeFrame, executeRequest]);

    useEffect(() => {
        isMounted.current = true;

        fetchHistoricData();

        return () => {
            isMounted.current = false;

            abortRef.current?.abort();

            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }
        };
    }, [fetchHistoricData]);

    const isPriceUp = useMemo(() => {
        if (!historicData || historicData.length < 2) return null;

        return historicData.at(-1)!.price > historicData[0].price;

    }, [historicData]);

    const themeColor =
        isPriceUp === null
            ? 'rgb(148, 163, 184)'
            : isPriceUp
                ? 'rgb(34, 197, 94)'
                : 'rgb(239, 68, 68)';


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

    return { historicData, loading, timeFrame, isPriceUp, themeColor, chartData, options, error, setTimeFrame, fetchHistoricData, setError, setLoading };
}