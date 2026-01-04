import { Input } from "../components/ui/input";
import CoinCard from "../components/coins/CoinCard";
import { Button } from "@/components/ui/button";
import CoinCardSkeleton from "@/components/coins/CoinCardSkeleton";
import { useMarkets } from "@/hooks/useMarkets";
import { motion } from "framer-motion";


function Markets() {

  const {
    search,
    setSearch,
    filter,
    setFilter,
    watchlist,
    setPage,
    page,
    isLoading,
    finalDisplayCoins,
  } = useMarkets();

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
          finalDisplayCoins.map((coin, index) => (
            <motion.div
              key={coin.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <CoinCard coin={coin} />
            </motion.div>
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
