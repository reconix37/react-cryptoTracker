import { Input } from "../components/ui/input";
import { Button } from "@/components/ui/button";
import { useMarkets } from "@/features/markets/hooks/useMarkets";
import { Star, Lock } from "lucide-react";
import CoinTable from "@/features/markets/components/CoinTable";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

function Markets() {
  const {
    search, setSearch,
    filter, setFilter,
    watchlist,
    isAuthenticated,
    isLoading,
    isOnCooldown, cooldown,
    finalDisplayCoins,
    sortConfig, requestSort,
    handleLoadMore, toggleWatchlist, handleReset,
  } = useMarkets();

  return (
    <div className="min-h-screen flex flex-col w-full items-center justify-start gap-6 bg-background text-foreground p-4 transition-colors duration-300">
      <h1 className="text-4xl font-bold mt-4">Crypto Tracker</h1>

      <Input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search Cryptocurrency..."
        className="max-w-sm w-full mb-4 bg-card border-border"
      />

      <div className="flex gap-4 mb-2">
        <Button
          variant={filter === "all" ? "default" : "secondary"}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${filter === "all" ? "bg-blue-600 shadow-md scale-105" : "hover:scale-105"
            }`}
          onClick={() => setFilter("all")}
        >
          All Coins
        </Button>

        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <div className="inline-block">
                <Button
                  variant={filter === "watchlist" ? "default" : "secondary"}
                  disabled={!isAuthenticated}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${filter === "watchlist" ? "bg-blue-600 shadow-md scale-105" : "hover:scale-105"
                    }`}
                  onClick={() => setFilter("watchlist")}
                >
                  <Star className={`w-4 h-4 mr-2 ${filter === "watchlist" ? "fill-white" : ""}`} />
                  Watchlist ({watchlist.length})
                </Button>
              </div>
            </TooltipTrigger>
            {!isAuthenticated && (
              <TooltipContent>
                <p className="flex items-center gap-2">
                  <Lock className="w-3 h-3" /> Login to use Watchlist
                </p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>

      <Button variant="ghost" size="sm" className="opacity-60 hover:opacity-100" onClick={handleReset}>
        Reset Filters
      </Button>

      <div className="w-full max-w-5xl bg-card border border-border rounded-2xl shadow-sm p-4 overflow-hidden">
        <CoinTable
          coins={finalDisplayCoins}
          watchlist={watchlist}
          isLoading={isLoading}
          onToggleWatchlist={toggleWatchlist}
          isAuthenticated={isAuthenticated}
          sortConfig={sortConfig}
          onSort={requestSort}
          renderEmptyState={() => (
            <div className="py-20 text-center text-muted-foreground">
              {search ? `No results for "${search}"` : "Nothing to show"}
            </div>
          )}
        />
      </div>

      {filter === "all" && !search && (
        <div className="mt-4 mb-10">
          <Button
            onClick={handleLoadMore}
            disabled={isLoading || isOnCooldown}
            variant="outline"
            className="min-w-[140px]"
          >
            {isLoading ? <span className="animate-pulse">Loading...</span> :
              isOnCooldown ? `Wait ${cooldown}s` : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
}

export default Markets;