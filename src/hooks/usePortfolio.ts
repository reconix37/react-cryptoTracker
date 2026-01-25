import { useState, useEffect, useMemo, } from "react";
import { useLocalStorage } from "./useLocalStorage";
import type { PortfolioAsset } from "@/types/PortfolioAsset";
import { toast } from "sonner";
import type { AssetsTransactions } from "@/types/PortfolioAsset";
import { useCrypto } from "@/contexts/CryptoProvider";
import type { Coin } from "@/types/Coin";
import { STORAGE_KEYS } from "@/configs/constants"


export function usePortfolio() {
  const [assets, setAssets] = useLocalStorage<PortfolioAsset[]>(STORAGE_KEYS.ASSETS, []);
  const [transactions, setTransactions] = useLocalStorage<AssetsTransactions[]>(STORAGE_KEYS.TRANSACTIONS, []);
  const [searchQuery, setSearchQuery] = useState("");
  const { error, isLoading, coins, refreshData, fetchExtraCoinsByIds } = useCrypto()
  const [extraCoins, setExtraCoins] = useState<Coin[]>([])
  const [failedIds, setFailedIds] = useState<Set<string>>(new Set());

  const assetIds = useMemo(() => assets.map(a => a.id), [assets]);

  useEffect(() => {
    const loadData = async () => {
      if (assetIds.length > 0) {
        await refreshData(true, assetIds);
      } else {
        await refreshData();
      }
    };
    loadData();
  }, [assetIds.join(','), refreshData]);

  useEffect(() => {
    if (!coins) return;

    const missingCoins = assets.filter(asset => {
      const inMain = coins.some(c => c.id === asset.id);
      const inExtra = extraCoins.some(c => c.id === asset.id);
      const failed = failedIds.has(asset.id);

      return !inMain && !inExtra && !failed;
    });

    if (missingCoins.length === 0) return;

    const missingIds = missingCoins.map(a => a.id).join(",");
    if (!missingIds) return;

    const loadMissing = async () => {
      const result = await fetchExtraCoinsByIds(missingIds);
      const returnedIds = new Set(result.map(c => c.id));

      if (result.length > 0) {
        setExtraCoins(prev => [...prev, ...result]);
      }
      const failed = missingCoins
        .map(a => a.id)
        .filter(id => !returnedIds.has(id));

      if (failed.length > 0) {
        setFailedIds(prev => {
          const next = new Set(prev);
          failed.forEach(id => next.add(id));
          return next;
        });
      }
    };

    loadMissing();
  }, [assets, coins, extraCoins, failedIds, fetchExtraCoinsByIds]);

  const coinsMap = useMemo(() => {
    const map = new Map<string, Coin>();

    coins?.forEach(c => {
      if (c && c.id) map.set(c.id, c);
    });

    extraCoins?.forEach(c => {
      if (c && c.id) map.set(c.id, c);
    });

    return map;
  }, [coins, extraCoins]);

  const enrichedAssets = useMemo(() => {
    return assets
      .filter(asset => asset.id.toLowerCase().includes(searchQuery.toLowerCase()))
      .map(asset => {
        const coin = coinsMap.get(asset.id)
        const isPriceLoading = !coin && isLoading;

        const currentPrice = coin?.current_price || asset.buyPrice;
        const totalValue = currentPrice * asset.amount;
        const profit = (currentPrice - asset.buyPrice) * asset.amount;

        return {
          ...asset,
          name: coin?.name || asset.id,
          symbol: coin?.symbol || "",
          image: coin?.image || null,
          currentPrice,
          totalValue,
          profit,
          profitPercent: asset.buyPrice > 0 ? ((currentPrice - asset.buyPrice) / asset.buyPrice) * 100 : 0,
          isProfit: profit >= 0,
          isPriceLoading
        };
      })
      .sort((a, b) => a.id.localeCompare(b.id));
  }, [assets, coinsMap, searchQuery]);

  const { totalBalance, totalCost } = useMemo(() => {
    return enrichedAssets.reduce((acc, curr) => ({
      totalBalance: acc.totalBalance + curr.totalValue,
      totalCost: acc.totalCost + (curr.amount * curr.buyPrice)
    }), { totalBalance: 0, totalCost: 0 });
  }, [enrichedAssets]);

  const share = useMemo(() => {
    const result: Record<string, number> = {};

    enrichedAssets.forEach(asset => {
      result[asset.id] =
        totalBalance > 0 ? (asset.totalValue / totalBalance) * 100 : 0;
    });

    return result;
  }, [enrichedAssets, totalBalance]);

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
    totalBalance, share,
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
    refetch: (force = false) => Promise.all([refreshData(force)]),
  };
}