import { Input } from "../components/ui/input";
import { Button } from "@/components/ui/button";
import { useMarkets } from "@/features/markets/hooks/useMarkets";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarketTableSkeleton } from "@/features/markets/components/CoinTableSkeleton";
import { formatCompactNumber } from "@/utils/formatCompactNumber";

function Markets() {
  const {
    search,
    setSearch,
    filter,
    setFilter,
    error,
    watchlist,
    marketList,
    page,
    isLoading,
    isOnCooldown,
    cooldown,
    finalDisplayCoins,
    isEmpty,
    handleLoadMore,
    toggleWatchlist,
    handleReset,
  } = useMarkets();

  const navigate = useNavigate();



  if (isLoading && marketList.length === 0) {
    return <MarketTableSkeleton rows={12} />;
  }

  return (
    <div className="min-h-screen flex flex-col w-full items-center justify-start gap-6 bg-background text-foreground p-4 transition-colors duration-300">

      <h1 className="text-4xl font-bold mt-4">Crypto Tracker App</h1>

      <Input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search Cryptocurrency..."
        className="max-w-sm w-full mb-4 bg-card border-border"
      />

      <div className="flex gap-4 mb-2">
        <Button
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer ${filter === "all"
            ? "bg-blue-600 text-white shadow-md scale-105 hover:bg-blue-700"
            : "bg-secondary text-secondary-foreground hover:bg-accent hover:scale-105"
            }`}
          onClick={() => setFilter("all")}
        >
          All Coins
        </Button>

        <Button
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer ${filter === "watchlist"
            ? "bg-blue-600 text-white shadow-md scale-105 hover:bg-blue-700"
            : "bg-secondary text-secondary-foreground hover:bg-accent hover:scale-105"
            }`}
          onClick={() => setFilter("watchlist")}
        >
          Watchlist ({watchlist.length})
        </Button>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-foreground px-4 py-2"
        onClick={handleReset}
      >
        Reset All
      </Button>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm mb-4 max-w-md text-center font-medium"
        >
          {error}
        </motion.div>
      )}
        <Table className="w-full border border-border rounded-xl overflow-hidden">
          <TableHeader className="bg-secondary/50">
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>24h Change</TableHead>
              <TableHead className="text-right">Market Cap</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isEmpty ? (
              <TableRow>
                <TableCell colSpan={5} className="h-40">
                  <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground animate-in fade-in-50">
                    {search ? (
                      <>
                        <p className="text-lg font-medium">Nothing found</p>
                        <p className="text-sm">
                          No results for{" "}
                          <span className="font-semibold">"{search}"</span>
                        </p>
                      </>
                    ) : filter === "watchlist" ? (
                      <>
                        <Star className="w-8 h-8 opacity-40" />
                        <p className="text-lg font-medium">
                          Your watchlist is empty
                        </p>
                        <p className="text-sm">
                          Click the star ⭐ to add coins
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-lg font-medium">No coins available</p>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              finalDisplayCoins.map((coin) => (
                <TableRow
                  key={coin.id}
                  onClick={() => navigate(`/coin/${coin.id}`)}
                  className="cursor-pointer transition-colors hover:bg-accent active:bg-accent/70"
                >
                  <TableCell className="pr-0">
                    <Star
                      className={cn(
                        "w-6 h-6 pl-2 cursor-pointer transition-all",
                        watchlist.includes(coin.id)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-muted-foreground hover:text-yellow-400"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWatchlist(coin.id);
                      }}
                    />
                  </TableCell>

                  <TableCell className="flex items-center gap-3 font-medium">
                    <img
                      src={coin.image}
                      alt={coin.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p>{coin.name}</p>
                      <p className="text-xs text-muted-foreground uppercase">
                        {coin.symbol}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    ${coin.current_price.toLocaleString()}
                  </TableCell>

                  <TableCell
                    className={
                      coin.price_change_percentage_24h >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    {coin.price_change_percentage_24h >= 0 ? "▲" : "▼"}
                    {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                  </TableCell>

                  <TableCell className="text-right">
                    ${formatCompactNumber(coin.market_cap)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      {filter === "all" && !search && !isLoading && (
        <div className="mt-4 mb-10 h-10 flex flex-col items-center justify-center gap-2">
          {isLoading && page > 1 ? (
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              <span className="text-sm text-muted-foreground">Loading page {page}...</span>
            </div>
          ) : (
            <>
              <Button
                variant="outline"
                className="border-border hover:bg-accent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                onClick={handleLoadMore}
                disabled={isLoading || isOnCooldown}
              >
                {cooldown > 0 ? `Wait ${cooldown}s...` : "Load More"}
              </Button>
              {isOnCooldown && (
                <span className="text-xs text-muted-foreground">
                  Cooldown to prevent rate limiting
                </span>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default Markets;