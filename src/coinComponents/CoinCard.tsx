import type { Coin } from "@/types/Coin";
import { Link } from "react-router-dom";

interface CoinCardProps {
    coin: Coin;
}

export default function CoinCard({ coin }: CoinCardProps) {
    return (
        <Link to={`/coin/${coin.id}`}>
            <div className="border p-4 rounded-lg  flex flex-col items-center bg-white shadow-md hover:scale-[1.02]" >
                <div className="flex justify-between items-center">
                    <img src={coin.image} alt={coin.name} className="w-5 h-5 mr-1" />
                    <h2 className="text-xl font-semibold text-black">{coin.name} ({coin.symbol.toUpperCase()}) </h2>
                </div>
                <p className="text-black">Current Price: ${coin.current_price.toLocaleString()} <span className={coin.price_change_percentage_24h > 0 ? "text-green-500 text-sm" : "text-red-500 text-sm"}>{coin.price_change_percentage_24h > 0 ? "+" : ""}{coin.price_change_percentage_24h.toFixed(2)}%</span></p>
                <p className="text-black">Market Cap: ${coin.market_cap.toLocaleString()}</p>
            </div>
        </Link>
    );
}