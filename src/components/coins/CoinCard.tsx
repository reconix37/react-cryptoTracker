import type { Coin } from "@/types/Coin";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AnimatedNumber } from "../ui/AnimatedNumbers";

interface CoinCardProps {
    coin: Coin;
}

export default function CoinCard({ coin }: CoinCardProps) {
    return (
        <Link to={`/coin/${coin.id}`}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="border p-4 rounded-lg  flex flex-col items-center bg-white shadow-md hover:scale-[1.02]" >
                <div className="flex justify-between items-center mb-2">
                    <img src={coin.image} alt={coin.name} className="w-5 h-5 mr-1" />
                    <h2 className="text-xl font-semibold text-black">{coin.name} ({coin.symbol.toUpperCase()}) </h2>
                </div>
                <div className="flex items-left flex-col">

                    <p className="text-black">Current Price: $<AnimatedNumber value={coin.current_price} /> <span className={coin.price_change_percentage_24h > 0 ? "text-green-500 text-sm" : "text-red-500 text-sm"}>{coin.price_change_percentage_24h > 0 ? "+" : ""}{coin.price_change_percentage_24h.toFixed(2)}%</span></p>
                    <p className="text-black">Market Cap: ${coin.market_cap.toLocaleString()}</p>
                </div>
            </motion.div>
        </Link>
    );
}