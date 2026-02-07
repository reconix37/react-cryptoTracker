import { Line } from "react-chartjs-2";
import { Button } from "@/components/ui/button";
import { useCoinChart } from "@/features/markets/hooks/useCoinsChart";

export default function CoinChart({ coinId }: { coinId?: string }) {
    const {
        loading,
        error,
        chartData,
        options,
        timeFrame,
        isPriceUp,
        setTimeFrame,
        fetchHistoricData,
        setError,
        setLoading,
    } = useCoinChart(coinId);

    const handleReset = () => {
        setError(null);
        setLoading(true);
        fetchHistoricData();
    };


    const timeframeButtonClass = (value: string) =>
        `px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
        ${timeFrame === value
            ? "bg-blue-600 text-white shadow-md scale-105"
            : "bg-secondary text-secondary-foreground hover:bg-accent hover:scale-105"
        }`;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 bg-card rounded-2xl border border-border">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
            </div>
        );
    }

    if (error?.type === "rate_limit") {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-card rounded-2xl border border-border gap-4">
                <p className="text-yellow-500 font-bold text-lg">
                    API limit reached
                </p>
                <p className="text-sm text-muted-foreground">
                    Retry in {error.retryAfter}s
                </p>
                <Button disabled>Waiting…</Button>
            </div>
        );
    }


    if (error?.type === "network") {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-card rounded-2xl border border-border gap-4">
                <p className="text-destructive font-bold text-lg">
                    Failed to load chart
                </p>
                <Button onClick={handleReset}>
                    Refresh
                </Button>
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
                        >
                            {value}D
                        </button>
                    ))}
                </div>

                {isPriceUp !== null && (
                    <span className={isPriceUp ? "text-green-500" : "text-red-500"}>
                        {isPriceUp ? "▲ Upward" : "▼ Downward"}
                    </span>
                )}
            </div>

            <div className="h-80 w-full">
                <Line options={options} data={chartData} />
            </div>
        </div>
    );
}
