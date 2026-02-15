import type { HistoricDataPoint } from "@/types/CoinChart";
import { useEffect, useRef, useState, useMemo } from "react";
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
import type { MarketChartResponse } from "@/types/MarketChartResponse";
import type { ChartError } from "@/types/ChartError";
import { MARKET_CONFIG } from "@/configs/constants";
import { CACHE_CONFIG } from "@/configs/constants";

ChartJS.register(
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

    const chartCache = useRef<Map<string, { data: HistoricDataPoint[], timestamp: number }>>(new Map());

    const lastFetchKey = useRef<string>('');

    const lastRequestTime = useRef<number>(0);

    useEffect(() => {
        const fetchKey = `${coinId}-${timeFrame}`;
        isMounted.current = true;

        if (!coinId) {
            setLoading(false);
            return;
        }

        const cached = chartCache.current.get(fetchKey);
        const now = Date.now();

        if (cached && (now - cached.timestamp < CACHE_CONFIG.CACHE_TTL)) {
            setHistoricData(cached.data);
            setLoading(false);
            setError(null);
            lastFetchKey.current = fetchKey;
            return;
        }
        if (fetchKey === lastFetchKey.current && historicData.length > 0) {
            return;
        }

        const timeSinceLastRequest = now - lastRequestTime.current;
        if (timeSinceLastRequest < 2000) {
            const waitTime = 2000 - timeSinceLastRequest;

            const timer = setTimeout(() => {
                setTimeFrame(prev => prev);
            }, waitTime);

            return () => clearTimeout(timer);
        }

        lastRequestTime.current = now;

        (async () => {
            setLoading(true);
            setError(null);

            if (abortRef.current) {
                abortRef.current.abort();
            }
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }

            const controller = new AbortController();
            abortRef.current = controller;

            try {
                const url = new URL('/api/crypto', window.location.origin);
                url.searchParams.append('path', `coins/${coinId}/market_chart`);
                url.searchParams.append('vs_currency', MARKET_CONFIG.DEFAULT_CURRENCY);
                url.searchParams.append('days', timeFrame);

                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => {
                        controller.abort();
                        reject(new Error('TIMEOUT'));
                    }, 60000);
                });

                const fetchPromise = fetch(url.toString(), {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' },
                    signal: controller.signal
                });

                const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;

                if (!response.ok) {
                    if (response.status === 429) {
                        throw new Error('RATE_LIMIT');
                    }
                    throw new Error(`HTTP ${response.status}`);
                }

                const data = await response.json() as MarketChartResponse;

                const points = data.prices.map(([time, price]) => ({ time, price }));

                chartCache.current.set(fetchKey, {
                    data: points,
                    timestamp: Date.now()
                });

                setHistoricData(points);
                setLoading(false);
                lastFetchKey.current = fetchKey;

            } catch (error: any) {
                if (error.name === 'AbortError' || error.message === 'TIMEOUT') {
                    if (isMounted.current) {
                        setError({ type: "network" });
                        setLoading(false);
                    }
                    return;
                }

                if (error.message === 'RATE_LIMIT') {
                    if (isMounted.current) {
                        setError({ type: "rate_limit", retryAfter: 60 });
                        setLoading(false);

                        retryTimeoutRef.current = setTimeout(() => {
                            if (isMounted.current) {
                                lastFetchKey.current = '';
                                lastRequestTime.current = 0;
                                setTimeFrame(prev => prev);
                            }
                        }, 60000);
                    }
                    return;
                }

                if (isMounted.current) {
                    setError({ type: "network" });
                    setLoading(false);
                }
            }
        })();

        return () => {
            setTimeout(() => {
                isMounted.current = false;
            }, 100);

            const hasCachedData = chartCache.current.has(fetchKey);
            if (!hasCachedData) {
                if (abortRef.current) {
                    abortRef.current.abort();
                }
            } 

            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }
        };
    }, [coinId, timeFrame]);


    const fetchHistoricData = () => {
        const fetchKey = `${coinId}-${timeFrame}`;
        lastFetchKey.current = '';
        lastRequestTime.current = 0;
        chartCache.current.delete(fetchKey);
        setLoading(true);
        setError(null);
        setTimeFrame(prev => prev);
    };

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

    return {
        historicData,
        loading,
        timeFrame,
        isPriceUp,
        themeColor,
        chartData,
        options,
        error,
        setTimeFrame,
        fetchHistoricData,
        setError,
        setLoading
    };
}