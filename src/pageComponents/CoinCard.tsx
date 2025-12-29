import type { Coin } from "@/types/Coin";

interface CoinCardProps {
    coin: Coin;
}

export default function CoinCard({coin}: CoinCardProps) {
    return (
        <>
        <div className="border p-4 rounded-lg  flex flex-col items-center bg-white shadow-md">
            <img src={coin.image} alt={coin.name} className="w-9 h-9 mb-2" />
            <h2 className="text-xl font-semibold">{coin.name} ({coin.symbol.toUpperCase()}) </h2>
            <p>Current Price: ${coin.current_price.toLocaleString()} <span className={coin.price_change_percentage_24h > 0 ? "text-green-500" : "text-red-500"}>{coin.price_change_percentage_24h.toFixed(2)}%</span></p>
            <p>Market Cap: ${coin.market_cap.toLocaleString()}</p>
          </div>
        </>
    );
}