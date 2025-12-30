import { useEffect, useState } from "react";
import type { Coin } from "../types/Coin";
import { Input } from "../components/ui/input";
import CoinCard from "../coinComponents/CoinCard";


function Home() {

  const [coins, setCoins] = useState([]);
  const [iLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const filteredCoins = coins.filter((coin: Coin) =>
    coin.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    fetchCoin();

    const interval = setInterval(() => {
      fetchCoin();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchCoin = async () => {
    try {
      const response = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1");
      const data = await response.json();
      setCoins(data);
    }
    catch (error) {
      console.error("Error fetching coin data:", error);
    }
  }

     if (!coins) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

  return (
    <div className="min-h-screen flex flex-col w-full items-center justify-start gap-6 bg-gray-100 p-4">
      <h1 className="text-2xl font-bold">Crypto Tracker App</h1>
      <Input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search Cryptocurrency..." className="max-w-sm w-full mb-4" />
      <div className="max-w-4xl grid md:grid-cols-2 lg:grid-cols-2 gap-4" >
        {filteredCoins.length === 0 ? <p className="col-span-full">No coins match your search.</p> : filteredCoins.map((coin: Coin) => (
          <CoinCard key={coin.id} coin={coin} />
        ))}
      </div>
    </div>
  )
}
export default Home
