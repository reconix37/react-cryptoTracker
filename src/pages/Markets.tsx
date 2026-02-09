import { Input } from "../components/ui/input";
import { Button } from "@/components/ui/button";
import { useMarkets } from "@/features/markets/hooks/useMarkets";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import CoinTable from "@/features/markets/components/CoinTable";

function Markets() {
  const {
    search,
    setSearch,
    filter,
    setFilter,
    error,
    watchlist,
    page,
    isLoading,
    isOnCooldown,
    cooldown,
    finalDisplayCoins,
    handleLoadMore,
    toggleWatchlist,
    handleReset,
  } = useMarkets();

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
      <div className="min-w-4xl bg-card border border-border rounded-2xl shadow-sm p-4">
        <CoinTable
          coins={finalDisplayCoins}
          watchlist={watchlist}
          isLoading={isLoading}
          onToggleWatchlist={toggleWatchlist}
          renderEmptyState={() => {
            if (search) {
              return (
                <div className="text-center text-muted-foreground">
                  <p className="text-lg font-medium">Nothing found</p>
                  <p>No results for "{search}"</p>
                </div>
              );
            }

            if (filter === "watchlist") {
              return (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Star className="w-8 h-8 opacity-40" />
                  <p>Your watchlist is empty</p>
                </div>
              );
            }

            return <p>No coins available</p>;
          }}
        />
      </div>
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