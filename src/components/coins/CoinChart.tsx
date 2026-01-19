import { Line } from 'react-chartjs-2';
import { useCoinChart } from "@/hooks/useCoinsChart";
import type { CoinChartProps } from '@/types/CoinChart';


export default function CoinChart({ coinId }: CoinChartProps) {

    const { historicData, loading, timeFrame, isPriceUp, chartData, options, setTimeFrame } = useCoinChart(coinId);

    const timeframeButtonClass = (value: string) =>
        `px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
    ${timeFrame === value
            ? 'bg-blue-600 text-white shadow-md scale-105'
            : 'bg-secondary text-secondary-foreground hover:bg-accent hover:scale-105'
        }`;


    if (loading || !historicData) return (
        <div className="flex items-center justify-center h-64 bg-card rounded-2xl border border-border">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="mt-8 p-6 border border-border rounded-2xl bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h3 className="text-xl font-bold">Price Chart</h3>
                    <p className="text-sm text-muted-foreground">{timeFrame} Days Period</p>
                </div>

                <div className="flex gap-2 bg-secondary/30 p-1 rounded-xl border border-border">
                    <button className={timeframeButtonClass("1")} onClick={() => setTimeFrame("1")}>1D</button>
                    <button className={timeframeButtonClass("7")} onClick={() => setTimeFrame("7")}>7D</button>
                    <button className={timeframeButtonClass("30")} onClick={() => setTimeFrame("30")}>30D</button>
                    <button className={timeframeButtonClass("90")} onClick={() => setTimeFrame("90")}>90D</button>
                </div>

                <span className={`text-sm font-bold px-3 py-1 rounded-full ${isPriceUp ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                    {isPriceUp ? '▲ Upward' : '▼ Downward'}
                </span>
            </div>

            <div className="h-80 w-full">
                <Line options={options} data={chartData} />
            </div>
        </div>
    );
}