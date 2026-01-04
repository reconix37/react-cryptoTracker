import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Button } from "@/components/ui/button";
import { useCoinCharts } from "@/hooks/useCoinsChart";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface CoinChartProps {
    coinId: string | undefined;
}

export default function CoinChart({ coinId }: CoinChartProps) {

    const { historicData, loading, timeFrame, setTimeFrame } = useCoinCharts(coinId);

    const timeframeButtonClass = (value: string) =>
        `px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
    ${timeFrame === value
            ? 'bg-blue-600 text-white shadow-md scale-105'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:scale-105'
        }`;


    if (loading || !historicData) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
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
                backgroundColor: isPriceUp ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
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
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
            }
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    maxRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: 8,
                    color: '#94a3b8',
                },
            },
            y: {
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
                ticks: {
                    callback: (value: any) => `$${value.toLocaleString()}`,
                    color: '#94a3b8',
                },
            },
        },
    };

    return (
        <div className="mt-8 p-6 border rounded-2xl bg-white shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Price Chart {timeFrame} Days</h3>
                <div className="flex gap-2">
                    <Button variant="default" className={timeframeButtonClass("1")} onClick={() => setTimeFrame("1")}>1D</Button>
                    <Button variant="default" className={timeframeButtonClass("7")} onClick={() => setTimeFrame("7")}>7D</Button>
                    <Button variant="default" className={timeframeButtonClass("30")} onClick={() => setTimeFrame("30")}>30D</Button>
                    <Button variant="default" className={timeframeButtonClass("90")} onClick={() => setTimeFrame("90")}>90D</Button>
                </div>
                <span className={`text-sm font-medium ${isPriceUp ? 'text-green-500' : 'text-red-500'}`}>
                    {isPriceUp ? '▲ Upward' : '▼ Downward'}
                </span>
            </div>
            <div className="h-87.5 w-full">
                <Line options={options} data={chartData} />
            </div>
        </div>
    );
}