import { useState, useEffect, useMemo, } from "react";
import { useLocalStorage } from "./useLocalStorage";
import type { PortfolioAsset } from "@/types/PortfolioAsset";
import { toast } from "sonner";
import { useCrypto } from "@/contexts/CryptoProvider";
import type { Coin } from "@/types/Coin";
import { STORAGE_KEYS } from "@/configs/constants"
import useTransactions from "./useTransactions";
import { calculatePortfolioStats, enrichAssetData } from "@/utils/portfolioMath";


export function usePortfolio() {
  const [assets, setAssets] = useLocalStorage<PortfolioAsset[]>(STORAGE_KEYS.ASSETS, []);
  const [searchQuery, setSearchQuery] = useState("");
  const { error, isLoading, coins, refreshData, fetchExtraCoinsByIds } = useCrypto()
  const [extraCoins, setExtraCoins] = useState<Coin[]>([])
  const [failedIds, setFailedIds] = useState<Set<string>>(new Set());

  const { transactions, addTransaction } = useTransactions();

  const assetIds = useMemo(() => assets.map(a => a.id), [assets]);

  useEffect(() => {
    document.title = "My Portfolio | CryptoTracker";
  },[]);

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
    coins?.forEach(c => c?.id && map.set(c.id, c));
    extraCoins?.forEach(c => c?.id && map.set(c.id, c));
    return map;
  }, [coins, extraCoins]);

  const enrichedAssets = useMemo(() => {
    return assets
      .filter(asset => asset.id.toLowerCase().includes(searchQuery.toLowerCase()))
      .map(asset => enrichAssetData(asset, coinsMap.get(asset.id), isLoading))
      .sort((a, b) => a.id.localeCompare(b.id));
  }, [assets, coinsMap, searchQuery, isLoading]);

  const stats = useMemo(() => calculatePortfolioStats(enrichedAssets), [enrichedAssets]);

  const share = useMemo(() => {
    const result: Record<string, number> = {};
    enrichedAssets.forEach(asset => {
      result[asset.id] = stats.totalBalance > 0 ? (asset.totalValue / stats.totalBalance) * 100 : 0;
    });
    return result;
  }, [enrichedAssets, stats.totalBalance]);

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

    addTransaction(newAsset, "buy")
    toast.success(`Added ${newAsset.id}`);
  };

  const handleDelete = (id: string) => {
    const asset = assets.find(a => a.id === id);
    const enriched = enrichedAssets.find(a => a.id === id);

    if (asset) {

      addTransaction(asset, "sell", enriched?.currentPrice);
      setAssets(prev => prev.filter(a => a.id !== id));

      toast.error(`Sold and removed ${id.toUpperCase()}`);
    }
  };

  return {
    assets,
    isLoading,
    error,
    enrichedAssets,
    transactions,
    coins,
    share,
    searchQuery,
    setSearchQuery,
    handleAddAsset,
    handleDelete,
    ...stats,
    totalProfitData: {
      profit: stats.totalProfit,
      percentage: stats.totalProfitPercent,
      isProfit: stats.totalProfit >= 0
    },
    chartData: enrichedAssets.map(a => ({ name: a.name, value: a.totalValue })).filter(v => v.value > 0),
    refetch: (force = false) => Promise.all([refreshData(force)]),
  };
}

