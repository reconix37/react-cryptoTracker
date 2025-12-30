import { useEffect, useState } from "react";

interface CoinChartProps {
    coinId: string | undefined;
}

export default function CoinChart({ coinId }: CoinChartProps) {

    const [historicData, setHistoricData] = useState<number[][]>([]);
    const [loading, setLoading] = useState(true);

    const fetchHistoricData = async (id: string) => {
        try {
            setLoading(true);
            const response = await fetch(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=7`);
            const data = await response.json();
            console.log(data);
            setHistoricData(data.prices);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching historic data:", error);
            setLoading(false);
        }
    }

    useEffect(() => {
        if (coinId){
            fetchHistoricData(coinId);
        }
    }, [coinId]);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    return (
        <div className="mt-8 p-4 border rounded-xl bg-white">
           <h3 className="text-lg font-bold mb-4">Price Chart (7 Days)</h3>
           Grafik will be here. Points loaded: {historicData.length}
        </div>
    );
}