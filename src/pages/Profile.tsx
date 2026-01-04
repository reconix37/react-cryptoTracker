import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, CircleDollarSign } from "lucide-react";
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
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Portfolio</h1>
          <p className="text-slate-500">Track your crypto assets and performance.</p>
        </div>
        <AddAssetDialog onAdd={handleAddAsset} marketData={allCoins} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-white shadow-sm border-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-slate-500">Total Balance</CardTitle>
              <Wallet className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                $<AnimatedNumber value={totalBalance} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div className="md:col-span-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}>
          <PortfolioChart data={chartData} />
        </motion.div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50">
          <h3 className="font-semibold text-lg">Your Assets</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {assets.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <CircleDollarSign className="mx-auto h-12 w-12 mb-4 opacity-20" />
              <p>Your portfolio is empty. Click "Add Asset" to start.</p>
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
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 md:p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {coin?.image && <img src={coin.image} alt="" className="w-10 h-10 rounded-full" />}
                      <div>
                        <p className="font-bold text-slate-900 uppercase">{asset.id}</p>
                        <p className="text-sm text-slate-500">{asset.amount} units</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="text-right">
                        <p className="font-bold text-slate-900">
                          {coin ? `$${value.toLocaleString()}` : "..."}
                        </p>
                        {coin && (
                          <p className="text-xs text-slate-400">
                            ${coin.current_price.toLocaleString()} / unit
                          </p>
                        )}
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(asset.id)}
                      >
                        Delete
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