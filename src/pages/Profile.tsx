import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { Coin } from "@/types/Coin";
import type { PortfolioAsset } from "@/types/PortfolioAsset";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Wallet, TrendingUp, CircleDollarSign } from "lucide-react";

export default function Profile() {
  const [assets, setAssets] = useLocalStorage<PortfolioAsset[]>("portfolio_assets", []);
  const [marketData, setMarketData] = useState<Coin[]>([]);

  const fetchMarketData = async () => {
    if (assets.length === 0) return;
    const ids = assets.map((a) => a.id).join(",");
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}`
      );
      const data = await response.json();
      setMarketData(data);
    } catch (error) {
      console.error("Error fetching coin data:", error);
    }
  };

  const totalBalance = assets.reduce((acc, asset) => {
    const coin = marketData.find((c) => c.id === asset.id);
    return acc + (coin ? coin.current_price * asset.amount : 0);
  }, 0);

  useEffect(() => {
    fetchMarketData();
  }, [assets]);

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Portfolio</h1>
          <p className="text-slate-500">Track your crypto assets and performance.</p>
        </div>
        <Button 
          onClick={() => setAssets([...assets, { id: 'solana', amount: 10 }])} className="bg-blue-600 hover:bg-blue-700 shadow-lg transition-all">
          <Plus className="mr-2 h-4 w-4" /> Add Asset
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white shadow-sm border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">Total Balance</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-green-500 flex items-center mt-1">
              <TrendingUp className="mr-1 h-3 w-3" /> Live prices from CoinGecko
            </p>
          </CardContent>
        </Card>
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
            assets.map((asset) => {
              const coin = marketData.find((c) => c.id === asset.id);
              const value = coin ? coin.current_price * asset.amount : 0;

              return (
                <div key={asset.id} className="p-4 md:p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    {coin?.image && <img src={coin.image} alt="" className="w-10 h-10 rounded-full" />}
                    <div>
                      <p className="font-bold text-slate-900 uppercase">{asset.id}</p>
                      <p className="text-sm text-slate-500">{asset.amount} units</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">
                      {coin ? `$${value.toLocaleString()}` : <span className="animate-pulse text-slate-300">...</span>}
                    </p>
                    {coin && (
                      <p className="text-xs text-slate-400">
                        ${coin.current_price.toLocaleString()} / unit
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}