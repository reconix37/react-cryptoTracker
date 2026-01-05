import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useCoinCharts } from "@/hooks/useCoinsChart";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface CoinChartProps {
    coinId: string | undefined;
}

export default function CoinChart({ coinId }: CoinChartProps) {
    const { historicData, loading, timeFrame, setTimeFrame } = useCoinCharts(coinId);
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

    const isPriceUp = historicData.length > 0 &&
        historicData[historicData.length - 1][1] > historicData[0][1];

    const themeColor = isPriceUp ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)';

    const chartData = {
        labels: historicData.map((dataPoint) => {
            const date = new Date(dataPoint[0]);
            if (timeFrame === "1") {
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
            return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
        }),
        datasets: [
            {
                data: historicData.map((dataPoint) => dataPoint[1]),
                borderColor: themeColor,
                // Используем чуть более выраженную заливку для темной темы
                backgroundColor: isPriceUp ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                borderWidth: 2,
            },
        ],
    };

    const options = {
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
    };

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
                <Line options={options as any} data={chartData} />
            </div>
        </div>
    );
}