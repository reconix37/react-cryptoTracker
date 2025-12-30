import { useEffect, useState } from "react";
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

    const [historicData, setHistoricData] = useState<number[][]>([]);
    const [loading, setLoading] = useState(true);
    const [timeFrame, setTimeFrame] = useState("7");

    const fetchHistoricData = async (id: string) => {
        try {
            if (historicData.length === 0) {
                setLoading(true);
            }
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
                <h3 className="text-xl font-bold">Price Chart (7 Days)</h3>
                <span className={`text-sm font-medium ${isPriceUp ? 'text-green-500' : 'text-red-500'}`}>
                    {isPriceUp ? '▲ Upward' : '▼ Downward'}
                </span>
            </div>
            <div className="h-[350px] w-full">
                <Line options={options} data={chartData} />
            </div>
        </div>
    );
}