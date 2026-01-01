import { useEffect, useState } from "react";
import type { Coin } from "../types/Coin";
import { Input } from "../components/ui/input";
import CoinCard from "../coinComponents/CoinCard";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Button } from "@/components/ui/button";
import CoinCardSkeleton from "@/coinComponents/CoinCardSkeleton";


function Markets() {

  const [coins, setCoins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [watchlist] = useLocalStorage<string[]>("watchlist", []);
  const [filter, setFilter] = useState<"all" | "watchlist">("all");
  const [page, setPage] = useState(1)

  const visibleCoins = coins.filter((coin: Coin) => {
    if (filter === "watchlist") {
      return watchlist.includes(coin.id);
    }
    return true;
  });

  const finalDisplayCoins = visibleCoins.filter((coin: Coin) =>
    coin.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    fetchCoin();

    if (page === 1) {
      const interval = setInterval(() => {
        fetchCoin();
      }, 60000);
      return () => clearInterval(interval);
    }

  }, [page]);

  useEffect(() => {
    document.title = `CryptoTracker | ${filter === 'all' ? 'Markets' : 'Watchlist'}`;
  }, [filter]);

  const fetchCoin = async () => {
    try {
      if (page === 1 && coins.length === 0) {
        setIsLoading(true);
      }
      const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=${page}`);
      const data = await response.json();
      setCoins(prev => page === 1 ? data : [...prev, ...data]);
      setIsLoading(false);
    }
    catch (error) {
      console.error("Error fetching coin data:", error);
    }
  }

  return (
    <div className="min-h-screen flex flex-col w-full items-center justify-start gap-6 bg-gray-100 p-4">
      <h1 className="text-2xl font-bold">Crypto Tracker App</h1>
      <Input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search Cryptocurrency..." className="max-w-sm w-full mb-4" />
      <div className="flex gap-4 mb-4">
        <Button
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${filter === "all" ? "bg-blue-600 text-white shadow-md scale-105" : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:scale-105"
            }`}
          onClick={() => setFilter("all")}
        >All Coins</Button>
        <Button
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${filter === "watchlist" ? "bg-blue-600 text-white shadow-md scale-105" : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:scale-105"
            }`}
          onClick={() => setFilter("watchlist")}
        >Watchlist ({watchlist.length})</Button>
      </div>
      <div className="max-w-4xl grid md:grid-cols-2 lg:grid-cols-2 gap-4 w-full">
        {isLoading && page === 1 ? (
          Array.from({ length: 10 }).map((_, i) => (
            <CoinCardSkeleton key={i} />
          ))
        ) : filter === "watchlist" && watchlist.length === 0 ? (
          <p className="col-span-full text-center text-gray-500">No coins match your search.</p>
        ) : (
          finalDisplayCoins.map((coin: Coin) => (
            <CoinCard key={coin.id} coin={coin} />
          ))
        )}
        {isLoading && page > 1 && (
          <>
            <CoinCardSkeleton />
            <CoinCardSkeleton />
          </>
        )}
      </div>
      {filter === "all" && !search && !isLoading && <Button variant={"default"} onClick={() => { setPage(page + 1) }}>More</Button>}
    </div>
  )
}
export default Markets
