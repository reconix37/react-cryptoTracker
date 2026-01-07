import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Wallet, CircleDollarSign, Trash2, Search, TrendingUp, TrendingDown } from "lucide-react";
import AddAssetDialog from "@/components/profile/AddAssetDialog";
import PortfolioChart from "@/components/profile/PortfolioChart";
import { usePortfolio } from "@/hooks/usePortfolio";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedNumber } from "@/components/ui/AnimatedNumbers";
import { cn } from "@/lib/utils";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Link } from "react-router-dom";

export default function Profile() {
  const {
    assets,
    allCoins,
    chartData,
    totalBalance,
    bestPerformer,
    worstPerformer,
    marketData,
    filteredAssets,
    searchQuery,
    setSearchQuery,
    handleAddAsset,
    handleDelete,
    totalProfitData
  } = usePortfolio();

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 bg-background text-foreground min-h-screen transition-colors duration-300">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Portfolio</h1>
          <p className="text-muted-foreground">Track your crypto assets and performance.</p>
        </div>
        <AddAssetDialog onAdd={handleAddAsset} marketData={allCoins} />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-card text-card-foreground border-border shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Total Balance
              </CardTitle>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Wallet className="h-4 w-4 text-primary" />
              </div>
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
                  <span>${Math.abs(totalProfitData.profit).toLocaleString()}</span>
                  <span className="opacity-80 ml-1">({totalProfitData.percentage.toFixed(2)}%)</span>
                  <span className="text-muted-foreground ml-1">all time</span>
                </div>
              </div>
              {assets.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-emerald-500/10 rounded-md">
                        <TrendingUp className="h-3 w-3 text-emerald-500" />
                      </div>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Top Gainer</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black uppercase">{bestPerformer?.symbol}</p>
                      <p className="text-xs font-bold text-emerald-500">+{bestPerformer?.change.toFixed(2)}%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-rose-500/10 rounded-md">
                        <TrendingDown className="h-3 w-3 text-rose-500" />
                      </div>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Top Loser</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black uppercase">{worstPerformer?.symbol}</p>
                      <p className="text-xs font-bold text-rose-500">{worstPerformer?.change.toFixed(2)}%</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>



        <motion.div className="md:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}>
          <div className="bg-card p-4 rounded-xl shadow-md border border-border h-full">
            <PortfolioChart data={chartData} />
          </div>
        </motion.div>


      </div>

      <div className="bg-card rounded-2xl shadow-md border border-border overflow-hidden">
        <div className="p-6 border-b border-border bg-muted/30">
          <h3 className="font-bold text-lg mb-4">Your Assets</h3>
          <motion.div
            whileFocus={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
            className="relative"
          >
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search coin..." className=" bg-muted/40 border-border rounded-xl px-10 py-2 text-sm font-medium placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary transition-all" />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </motion.div>
        </div>

        <div className="divide-y divide-border">
          {assets.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <CircleDollarSign className="mx-auto h-16 w-16 mb-4 opacity-10" />
              <p className="text-lg">Your portfolio is empty.</p>
            </div>
          ) : (
            filteredAssets.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <p>No coins found matching "{searchQuery}"</p>
              </div>
            ) : (

              <AnimatePresence mode="popLayout">
                {filteredAssets.map((asset) => {
                  const coin = marketData.find((c) => c.id === asset.id);
                  const value = coin ? coin.current_price * asset.amount : 0;
                  const assetProfit = coin ? (coin.current_price - asset.buyPrice) * asset.amount : 0;
                  const assetProfitPercent = coin ? ((coin.current_price - asset.buyPrice) / asset.buyPrice) * 100 : 0;
                  const isAssetProfit = assetProfit >= 0;

                  return (
                    <motion.div
                      key={asset.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="p-5 flex items-center justify-between hover:bg-muted/50 transition-all group"
                    >
                      <Link to={`/coin/${asset.id}`}>
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="absolute inset-0 bg-primary blur-lg opacity-0 group-hover:opacity-20 transition-opacity"></div>
                            {coin?.image && (
                              <img
                                src={coin.image}
                                alt=""
                                className="w-12 h-12 rounded-full relative z-10 border-2 border-background"
                              />
                            )}
                          </div>
                          <div>
                            <p className="font-black uppercase tracking-tight">{asset.id}</p>
                            <p className="text-sm font-medium text-muted-foreground">{asset.amount.toLocaleString()} units</p>
                          </div>
                        </div>
                      </Link>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="flex gap-2 justify-end items-center">
                            <p className="font-bold text-lg">
                              {coin ? `$${value.toLocaleString()}` : "..."}
                            </p>
                            <p className={cn(
                              "text-xs font-bold px-1.5 py-0.5 rounded inline-block mt-1",
                              isAssetProfit ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                            )}>
                              {isAssetProfit ? "+" : ""}{assetProfitPercent.toFixed(2)}%
                            </p>
                          </div>
                          <p className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded mt-1">
                            ${coin?.current_price.toLocaleString()} / unit
                          </p>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action will remove the coin from your portfolio, but you can add it back again.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(asset.id)}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            ))}
        </div>
      </div>
    </div>
  );
}