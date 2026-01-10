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
    enrichedAssets,
    transactions,
    allCoins,
    chartData,
    totalBalance,
    bestPerformer,
    worstPerformer,
    searchQuery,
    totalProfitData,
    setSearchQuery,
    handleAddAsset,
    handleDelete,
    refetch,
  } = usePortfolio();

  const {
    refetch: refetchFearGreed
  } = useFearGreed();

  const handleGlobalRefetch = async () => {
    await Promise.all([refetch(true), refetchFearGreed(true)])
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 bg-background text-foreground min-h-screen">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Portfolio</h1>
          <p className="text-muted-foreground">Track your crypto assets and performance.</p>
        </div>
        <AddAssetDialog onAdd={handleAddAsset} marketData={allCoins} />
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-3 w-3 text-emerald-500" />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Top Gainer</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black uppercase">{bestPerformer?.symbol}</p>
                      <p className="text-xs font-bold text-emerald-500">+{bestPerformer?.profitPercent.toFixed(2)}%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-3 w-3 text-rose-500" />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Top Loser</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black uppercase">{worstPerformer?.symbol}</p>
                      <p className="text-xs font-bold text-rose-500">{worstPerformer?.profitPercent.toFixed(2)}%</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <FearGreedWidget />
          </motion.div>

          <div className="bg-card rounded-xl shadow-md border flex flex-col h-100">
            <div className="p-4 border-b bg-muted/20 flex items-center gap-2 shrink-0">
              <History className="h-4 w-4 text-primary" />
              <h3 className="font-bold text-sm uppercase">Activity</h3>
            </div>
            <div className="overflow-y-auto grow"><TransactionHistory transactions={transactions} allCoins={allCoins} /></div>
          </div>
        </motion.div>
        <motion.div className="md:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="bg-card p-4 rounded-xl shadow-md border h-full min-h-100">
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
            <Alert variant="destructive" className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircleIcon className="h-5 w-5" />
                <div>
                  <AlertTitle className="font-bold">Update Failed</AlertTitle>
                  <p className="text-sm opacity-90">{error}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGlobalRefetch()}
                className="ml-auto bg-transparent border-white/20 hover:bg-white/10"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </Alert>
          )}
          {
            isLoading && enrichedAssets.length === 0 &&
            Array.from({ length: 10 }).map((_, i) => (
              <PortfolioSkeleton key={i} />
            ))
          }
          {!isLoading && assets.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <CircleDollarSign className="mx-auto h-16 w-16 mb-4 opacity-10" />
              <p>Your portfolio is empty.</p>
            </div>
          ) : !isLoading && assets.length > 0 && enrichedAssets.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">No coins found matching "{searchQuery}"</div>
          ) : (
            <AnimatePresence mode="popLayout">
              {enrichedAssets.map((asset) => (
                <motion.div
                  key={asset.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-5 flex items-center justify-between hover:bg-muted/50 group transition-all"
                >
                  <Link to={`/coin/${asset.id}`} className="flex items-center gap-4">
                    <div className="relative">
                      <img src={asset.image} alt="" className="w-12 h-12 rounded-full border-2 border-background z-10 relative" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="font-black uppercase">{asset.id}</p>
                      <p className="text-xs text-muted-foreground">{asset.amount.toLocaleString()} units</p>
                      <div className="w-24 bg-muted h-1 rounded-full overflow-hidden mt-1">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${asset.share}%` }}
                          className="bg-primary h-full"
                        />
                      </div>
                    </div>
                  </Link>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="flex gap-2 justify-end items-center">
                        <p className="font-bold text-lg">{formatCurrency(asset.totalValue)}</p>
                        <p className={cn(
                          "text-xs font-bold px-1.5 py-0.5 rounded",
                          asset.isProfit ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                        )}>
                          {asset.isProfit ? "+" : ""}{asset.profitPercent.toFixed(2)}%
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded mt-1 inline-block">
                        {formatCurrency(asset.currentPrice)} / unit
                      </p>
                    </div>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>This will remove {asset.id.toUpperCase()} from your portfolio.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(asset.id)}>Remove</AlertDialogAction>
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
  );
}