import { Line } from "react-chartjs-2";
import { Button } from "@/components/ui/button";
import { useCoinChart } from "@/features/markets/hooks/useCoinsChart";
import { Loader2, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

export default function CoinChart({ coinId }: { coinId?: string }) {
    const {
        loading,
        error,
        chartData,
        options,
        timeFrame,
        isPriceUp,
        historicData,
        setTimeFrame,
        fetchHistoricData,
        setError,
    } = useCoinChart(coinId);

    const [loadingSeconds, setLoadingSeconds] = useState(0);

    useEffect(() => {
        if (loading) {
            setLoadingSeconds(0);
            const interval = setInterval(() => {
                setLoadingSeconds(prev => prev + 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [loading]);

    const handleReset = () => {
        setError(null);
        fetchHistoricData();
    };

    const timeframeButtonClass = (value: string) =>
        `px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
        ${timeFrame === value
            ? "bg-blue-600 text-white shadow-md scale-105"
            : "bg-secondary text-secondary-foreground hover:bg-accent hover:scale-105"
        }`;

    if (error?.type === "rate_limit") {
        return (
            <div className="mt-8 p-6 min-h-[480px] border border-border rounded-2xl bg-card">
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <p className="text-yellow-500 font-bold text-lg">
                        API limit reached
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Retry in {error.retryAfter}s
                    </p>
                    <Button disabled>Waiting…</Button>
                </div>
            </div>
        );
    }

    if (error?.type === "network") {
        return (
            <div className="mt-8 p-6 min-h-[480px] border border-border rounded-2xl bg-card">
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <p className="text-destructive font-bold text-lg">
                        Failed to load chart
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Request timeout or network error
                    </p>
                    <Button onClick={handleReset}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-8 p-6 min-h-[480px] border border-border rounded-2xl bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h3 className="text-xl font-bold">Price Chart</h3>
                    <p className="text-sm text-muted-foreground">
                        {timeFrame} Days Period
                    </p>
                </div>

                <div className="flex gap-2 bg-secondary/30 p-1 rounded-xl border border-border">
                    {["1", "7", "30", "90"].map((value) => (
                        <button
                            key={value}
                            className={timeframeButtonClass(value)}
                            onClick={() => setTimeFrame(value)}
                            disabled={loading && timeFrame !== value}
                        >
                            {value}D
                        </button>
                    ))}
                </div>

                {isPriceUp !== null && !loading && (
                    <span className={isPriceUp ? "text-green-500" : "text-red-500"}>
                        {isPriceUp ? "▲ Upward" : "▼ Downward"}
                    </span>
                )}
            </div>


            <div className="relative h-80 w-full">
                {loading && historicData.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/50 backdrop-blur-sm rounded-lg z-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                        <p className="text-sm text-muted-foreground">
                            Loading chart data...
                        </p>
                        {loadingSeconds > 5 && (
                            <p className="text-xs text-muted-foreground mt-2">
                                {loadingSeconds}s elapsed - API may be slow
                            </p>
                        )}
                        {loadingSeconds > 30 && (
                            <p className="text-xs text-yellow-500 mt-1">
                                Still loading... CoinGecko free API can be slow
                            </p>
                        )}
                    </div>
                ) : loading ? (
                    <div className="absolute top-0 right-0 p-2 z-10">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                ) : null}
                {historicData.length > 0 && (
                    <div className={`absolute inset-0 ${loading ? "opacity-50" : "opacity-100"} transition-opacity duration-300`}>
                        <Line options={options} data={chartData} />
                    </div>
                )}
            </div>
        </div>
    );
}