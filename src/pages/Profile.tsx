import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, CircleDollarSign, Trash2 } from "lucide-react";
import AddAssetDialog from "@/components/profile/AddAssetDialog";
import PortfolioChart from "@/components/profile/PortfolioChart";
import { usePortfolio } from "@/hooks/usePortfolio";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedNumber } from "@/components/ui/AnimatedNumbers";

export default function Profile() {
  const {
    assets,
    allCoins,
    chartData,
    totalBalance,
    marketData,
    handleAddAsset,
    handleDelete
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
              </div>
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
          <h3 className="font-bold text-lg">Your Assets</h3>
        </div>

        <div className="divide-y divide-border">
          {assets.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <CircleDollarSign className="mx-auto h-16 w-16 mb-4 opacity-10" />
              <p className="text-lg">Your portfolio is empty.</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {assets.map((asset) => {
                const coin = marketData.find((c) => c.id === asset.id);
                const value = coin ? coin.current_price * asset.amount : 0;

                return (
                  <motion.div
                    key={asset.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-5 flex items-center justify-between hover:bg-muted/50 transition-all group"
                  >
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
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          {coin ? `$${value.toLocaleString()}` : "..."}
                        </p>
                        <p className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded mt-1">
                          ${coin?.current_price.toLocaleString()} / unit
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={() => handleDelete(asset.id)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}