import { useState, useEffect, useMemo, } from "react";
import { useLocalStorage } from "./useLocalStorage";
import type { PortfolioAsset } from "@/types/PortfolioAsset";
import { toast } from "sonner";
import type { AssetsTransactions } from "@/types/PortfolioAsset";
import { useCrypto } from "@/contexts/CryptoProvider";


export function usePortfolio() {
  const [assets, setAssets] = useLocalStorage<PortfolioAsset[]>("portfolio_assets", []);
  const [transactions, setTransactions] = useLocalStorage<AssetsTransactions[]>("assets_transactions", []);
  const [searchQuery, setSearchQuery] = useState("");
  const { error, isLoading, coins, refreshData } = useCrypto()

  const assetIds = useMemo(() => assets.map(a => a.id), [assets]);

  useEffect(() => {
    if (assetIds.length > 0) {
      refreshData(true, assetIds);
    } else {
      refreshData();
    }
  }, [assetIds, refreshData]);


  const { totalBalance, totalCost } = useMemo(() => {
    let balance = 0, cost = 0;
    assets.forEach(asset => {
      const coin = coins.find(c => c.id === asset.id)
      balance += coin ? coin.current_price * asset.amount : 0;
      cost += asset.amount * asset.buyPrice;
    });
    return { totalBalance: balance, totalCost: cost };
  }, [assets, coins]);

  const enrichedAssets = useMemo(() => {
    return assets
      .filter(asset => asset.id.toLowerCase().includes(searchQuery.toLowerCase()))
      .map(asset => {

        const coin = coins.find(c => c.id === asset.id)
        const currentPrice = coin?.current_price || 0;
        const value = currentPrice * asset.amount;
        const profit = (currentPrice - asset.buyPrice) * asset.amount;

        return {
          ...asset,
          name: coin?.name || asset.id,
          symbol: coin?.symbol || "",
          image: coin?.image || null,
          currentPrice,
          totalValue: value,
          profit,
          profitPercent: asset.buyPrice > 0 ? ((currentPrice - asset.buyPrice) / asset.buyPrice) * 100 : 0,
          share: totalBalance > 0 ? (value / totalBalance) * 100 : 0,
          isProfit: profit >= 0
        };
      }).sort((a, b) => b.totalValue - a.totalValue);
  }, [assets, coins, searchQuery, totalBalance]);

  const performingAssets = useMemo(() =>
    enrichedAssets.filter(a => a.currentPrice > 0 && a.profitPercent !== 0),
    [enrichedAssets]);

  const handleAddAsset = (newAsset: PortfolioAsset) => {
    setAssets(prev => {
      const existing = prev.find(a => a.id === newAsset.id);
      if (existing) {
        return prev.map(a => {
          if (a.id === newAsset.id) {
            const totalAmount = a.amount + newAsset.amount;
            const avgPrice = ((a.amount * a.buyPrice) + (newAsset.amount * newAsset.buyPrice)) / totalAmount;
            return { ...a, amount: totalAmount, buyPrice: avgPrice };
          }
          return a;
        });
      }
      return [...prev, newAsset];
    });

    const trans: AssetsTransactions = {
      ...newAsset,
      coinId: newAsset.id,
      id: crypto.randomUUID(),
      date: Date.now(),
      type: "buy"
    };
    setTransactions(p => [trans, ...p]);
    toast.success(`Added ${newAsset.id}`);
  };

  const handleDelete = (id: string) => {
    const asset = assets.find(a => a.id === id);
    const enriched = enrichedAssets.find(a => a.id === id);

    if (asset) {

      const sellTransaction: AssetsTransactions = {
        id: crypto.randomUUID(),
        coinId: asset.id,
        amount: asset.amount,

        buyPrice: enriched?.currentPrice || asset.buyPrice,
        date: Date.now(),
        type: "sell"
      };
      setTransactions(prev => [sellTransaction, ...prev]);

      setAssets(prev => prev.filter(a => a.id !== id));

      toast.error(`Sold and removed ${id.toUpperCase()}`);
    }
  };



  return {
    assets, isLoading, error, enrichedAssets, transactions, coins,
    totalBalance,
    bestPerformer: performingAssets.length > 0
      ? [...performingAssets].sort((a, b) => b.profitPercent - a.profitPercent)[0]
      : null,
    worstPerformer: performingAssets.length > 0
      ? [...performingAssets].sort((a, b) => a.profitPercent - b.profitPercent)[0]
      : null,
    totalProfitData: {
      profit: totalBalance - totalCost,
      percentage: totalCost > 0 ? ((totalBalance - totalCost) / totalCost) * 100 : 0,
      isProfit: (totalBalance - totalCost) >= 0
    },
    chartData: enrichedAssets.map(a => ({ name: a.name, value: a.totalValue })).filter(v => v.value > 0),
    searchQuery, setSearchQuery, handleAddAsset, handleDelete,
    refetch: (force = false) => Promise.all([refreshData()]),
  };
}