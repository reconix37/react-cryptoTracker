import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Wallet, CircleDollarSign, Trash2, Search, TrendingUp, TrendingDown, History, AlertCircleIcon, RefreshCw } from "lucide-react";
import AddAssetDialog from "@/components/profile/AddAssetDialog";
import PortfolioChart from "@/components/profile/PortfolioChart";
import { usePortfolio } from "@/hooks/usePortfolio";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedNumber } from "@/components/ui/AnimatedNumbers";
import { cn } from "@/lib/utils";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Link } from "react-router-dom";
import TransactionHistory from "@/components/profile/TransactionHistory";
import { Alert, AlertTitle } from "@/components/ui/alert";
import PortfolioSkeleton from "@/components/profile/PortfolioSkeleton";
import FearGreedWidget from "@/components/profile/FearGreedWidget";
import { useFearGreed } from "@/hooks/useFearGreed";
import { useCrypto } from "@/contexts/CryptoProvider";
import { useAuth } from "@/contexts/AuthProvider";
import Auth from "./Auth";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: value < 1 ? 4 : 2,
    maximumFractionDigits: value < 1 ? 6 : 2,
  }).format(value);
};


export default function Profile() {
  const {
    assets,
    isLoading,
    error,
    coins,
    enrichedAssets,
    transactions,
    chartData,
    totalBalance,
    bestPerformer,
    worstPerformer,
    searchQuery,
    share,
    totalProfitData,
    setSearchQuery,
    handleAddAsset,
    handleDelete,
    refetch,
  } = usePortfolio();

  const { refetch: refetchFearGreed } = useFearGreed();
  const { lastUpdated } = useCrypto()
  const { isAuthenticated, login, logout, isLoading: isAuthLoading } = useAuth()
  const formatted = new Date(lastUpdated ?? Date.now()).toLocaleTimeString();


  const handleGlobalRefetch = async () => {
    await Promise.all([refetch(true), refetchFearGreed(true)]);
  };

  return (
    <>
      {isAuthenticated ? (
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 bg-background text-foreground min-h-screen">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Portfolio</h1>
              <p className="text-muted-foreground">
                {lastUpdated
                  ? `Last updated: ${formatted}`
                  : "Track your crypto assets and performance."}
              </p>
              <Button variant={"outline"} onClick={logout} className="mt-2 w-full">Log out</Button>
            </div>
            <AddAssetDialog onAdd={handleAddAsset} marketData={coins || []} isLoading={isLoading} />
          </div>

          <div className="grid gap-6 md:grid-cols-3">

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <Card className="bg-card shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Total Balance</CardTitle>
                  <div className="p-2 bg-primary/10 rounded-lg"><Wallet className="h-4 w-4 text-primary" /></div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black">
                    <span className="text-primary mr-1">$</span>
                    <AnimatedNumber value={totalBalance} />
                    <div className={cn(
                      "flex items-center gap-1 text-sm font-medium mt-1",
                      totalProfitData.isProfit ? "text-emerald-500" : "text-rose-500"
                    )}>
                      <span>{totalProfitData.isProfit ? "▲" : "▼"}</span>
                      <span>{formatCurrency(Math.abs(totalProfitData.profit))}</span>
                      <span className="opacity-80">({totalProfitData.percentage.toFixed(2)}%)</span>
                    </div>
                  </div>
                  {assets.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-border/50 space-y-4">
                      {bestPerformer && bestPerformer.profitPercent > 0 && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-3 w-3 text-emerald-500" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Top Gainer</span>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-black uppercase">{bestPerformer.symbol}</p>
                            <p className="text-xs font-bold text-emerald-500">
                              +{bestPerformer.profitPercent.toFixed(2)}%
                            </p>
                          </div>
                        </div>
                      )}
                      {worstPerformer && worstPerformer.profitPercent < 0 && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <TrendingDown className="h-3 w-3 text-rose-500" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Top Loser</span>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-black uppercase">{worstPerformer.symbol}</p>
                            <p className="text-xs font-bold text-rose-500">
                              {worstPerformer.profitPercent.toFixed(2)}%
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <FearGreedWidget />

              <div className="bg-card rounded-xl shadow-md border flex flex-col h-100">
                <div className="p-4 border-b bg-muted/20 flex items-center gap-2 shrink-0">
                  <History className="h-4 w-4 text-primary" />
                  <h3 className="font-bold text-sm uppercase">Activity</h3>
                </div>
                <div className="overflow-y-auto grow">
                  <TransactionHistory transactions={transactions} allCoins={coins} />
                </div>
              </div>
            </motion.div>

            <motion.div className="md:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>

              <div className="bg-card p-6 rounded-xl shadow-md border h-full min-h-[600px] flex items-center justify-center">
                <PortfolioChart data={chartData} />
              </div>
            </motion.div>
          </div>

          <div className="bg-card rounded-2xl shadow-md border overflow-hidden">
            <div className="p-6 border-b bg-muted/30">
              <h3 className="font-bold text-lg mb-4">Your Assets</h3>
              <div className="relative">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search coin..."
                  className="pl-10 rounded-xl"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="divide-y">
              {error && (
                <div className="p-4">
                  <Alert variant="destructive" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-rose-500/10 border-rose-500/20 text-rose-600">
                    <div className="flex items-center gap-3">
                      <AlertCircleIcon className="h-5 w-5 shrink-0" />
                      <div>
                        <AlertTitle className="font-bold text-sm sm:text-base">Rate Limit Active</AlertTitle>
                        <p className="text-xs sm:text-sm opacity-90">{error}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGlobalRefetch}
                      disabled={isLoading}
                      className="shrink-0 border-rose-500/20 hover:bg-rose-500/20 text-xs"
                    >
                      <RefreshCw className={cn("mr-2 h-3 w-3", isLoading && "animate-spin")} />
                      Retry
                    </Button>
                  </Alert>
                </div>
              )}

              {isLoading && enrichedAssets.length === 0 &&
                Array.from({ length: 5 }).map((_, i) => <PortfolioSkeleton key={i} />)
              }

              {!isLoading && assets.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <CircleDollarSign className="mx-auto h-16 w-16 mb-4 opacity-10" />
                  <p>Your portfolio is empty.</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {enrichedAssets.map((asset) => (
                    <motion.div
                      key={asset.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-muted/50 group transition-all gap-4"
                    >
                      <Link to={`/coin/${asset.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="relative shrink-0">
                          {asset.image ? (
                            <img src={asset.image} alt="" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-background z-10 relative" />
                          ) : (
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-[10px] z-10 relative font-bold">
                              {asset.symbol?.toUpperCase() || "?"}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <p className="font-black uppercase truncate text-sm sm:text-base">{asset.id}</p>
                          <p className="text-xs text-muted-foreground">{asset.amount.toLocaleString()} units</p>
                          <div className="w-24 bg-muted h-1 rounded-full overflow-hidden mt-1">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(share[asset.id] ?? 0, 100)}%` }}
                              className="bg-primary h-full"
                            />
                          </div>
                        </div>
                      </Link>

                      <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 w-full sm:w-auto border-t sm:border-0 pt-3 sm:pt-0">
                        <div className="text-left sm:text-right">
                          <div className="flex gap-2 justify-start sm:justify-end items-center">
                            <p className="font-bold text-base sm:text-lg">{formatCurrency(asset.totalValue)}</p>
                            <p className={cn(
                              "text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded",
                              asset.isPriceLoading
                                ? "bg-muted text-muted-foreground"
                                : asset.isProfit ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                            )}>
                              {asset.isPriceLoading ? "..." : `${asset.isProfit ? "+" : ""}${asset.profitPercent.toFixed(2)}%`}
                            </p>
                          </div>
                          <p className="text-[10px] sm:text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded mt-1 inline-flex items-center gap-1.5">
                            {asset.isPriceLoading ? (
                              <>
                                <RefreshCw className="h-3 w-3 animate-spin" />
                                <span>Loading price...</span>
                              </>
                            ) : (
                              <>
                                {formatCurrency(asset.currentPrice)}
                                <span className="opacity-70 ml-0.5">/ unit</span>
                              </>
                            )}
                          </p>
                        </div>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>This will remove {asset.id.toUpperCase()} and its history.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleDelete(asset.id);
                                }}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 bg-background text-foreground min-h-screen flex flex-col items-center justify-center">
          <Auth />
        </div>
      )}
    </>
  );
}