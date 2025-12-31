import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { CoinDetails } from "../types/Coin";
import { Button } from "@/components/ui/button";
import CoinChart from "@/coinComponents/CoinChart";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export default function CoinPages() {
    const { id } = useParams();
    const [coinDetails, setCoinDetails] = useState<CoinDetails | null>(null);
    const [watchlist, setWatchlist] = useLocalStorage<string[]>("watchlist", []);

    const fetchCoinDetails = async (coinId: string | undefined) => {
        try {
            const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`);
            const data = await response.json();
            setCoinDetails(data);
        }
        catch (error) {
            console.error("Error fetching coin details:", error);
        }
    }

    const isInWatchlist = id ? watchlist.includes(id) : false;

    const toggleWatchlist = () => {
        if (!id) return;

        if (isInWatchlist) {
            setWatchlist(watchlist.filter(coin => coin !== id));
        } else {
            setWatchlist([...watchlist, id]);
        }
    }

    const formatCompactNumber = (number: number) => {
        return Intl.NumberFormat("en-US", {
            notation: "compact",
            maximumFractionDigits: 2,
        }).format(number);
    };

    useEffect(() => {
        fetchCoinDetails(id);

        const interval = setInterval(() => {
            fetchCoinDetails(id);
        }, 60000);

        return () => clearInterval(interval);

    }, [id]);

    if (!coinDetails) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    return (
        <>
            <div>
                {coinDetails && (
                    <div className="max-w-4xl mx-auto p-6">
                        <Link to="/" className="text-blue-500 hover:underline mb-6 inline-block"><Button>← Back to assets</Button></Link>
                        <div className="bg-white rounded-2xl shadow-sm border p-8 flex flex-col md:flex-row gap-8 items-center md:items-start">
                            <img src={coinDetails.image.large} className="w-32 h-32" alt={coinDetails.name} />
                            <div className="flex-1 text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-4">
                                    <h1 className="text-4xl font-bold mb-2">{coinDetails.name} <span className="text-gray-400 uppercase">{coinDetails.symbol}</span></h1>
                                    <Button onClick={toggleWatchlist} variant="default" className={`transition-all duration-200 ${isInWatchlist ? "border-yellow-500 text-yellow-600 hover:scale-105 " : "bg-yellow-500 hover:scale-105 text-white border-none"}`}>
                                        {isInWatchlist ? "In Watchlist ★" : "Add to Watchlist ☆"}
                                    </Button>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <p className="text-gray-500 text-sm">Price</p>
                                        <p className="text-xl font-bold">${coinDetails.market_data.current_price.usd.toLocaleString()}<span className={coinDetails.market_data.price_change_percentage_24h > 0 ? "text-green-500 ml-2 text-sm" : "text-red-500 ml-2 text-sm"}>{coinDetails.market_data.price_change_percentage_24h > 0 ? "+" : ""}{coinDetails.market_data.price_change_percentage_24h.toFixed(2)}%</span></p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <p className="text-gray-500 text-sm">Market Cap</p>
                                        <p className="text-xl font-bold">${formatCompactNumber(coinDetails.market_data.market_cap.usd)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <CoinChart coinId={id} />
                        <div className=" mt-8">
                            <h3 className="text-2xl font-semibold mb-4">About {coinDetails.name}</h3>
                            {coinDetails.description.en ? <p className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: coinDetails.description.en }}></p> : <p className="text-gray-700 leading-relaxed" >No description available.</p>}
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}