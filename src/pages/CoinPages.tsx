import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button";
import CoinChart from "@/components/coins/CoinChart";
import { useCoinPages } from "@/hooks/useCoinPages";


export default function CoinPages() {
    const {
        coinDetails,
        id,
        isInWatchlist,
        toggleWatchlist,
        formatCompactNumber

    } = useCoinPages()

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
                                    <button type="button" onClick={toggleWatchlist} className={`transition-all duration-200 ${isInWatchlist ? "border-yellow-500 text-yellow-600 hover:scale-105 " : "bg-yellow-500 hover:scale-105 text-white border-none"}`}>
                                        {isInWatchlist ? "In Watchlist ★" : "Add to Watchlist ☆"}
                                    </button>
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
                        <div className=" mt-8 [&_a]:text-blue-500 [&_a]:hover:underline">
                            <h3 className="text-2xl font-semibold mb-4">About {coinDetails.name}</h3>
                            {coinDetails.description.en ? <p className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: coinDetails.description.en }}></p> : <p className="text-gray-700 leading-relaxed" >No description available.</p>}
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}