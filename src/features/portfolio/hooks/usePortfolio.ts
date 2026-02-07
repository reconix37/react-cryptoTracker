import { useAuth } from "@/providers/AuthProvider";
import { useCrypto } from "@/providers/CryptoProvider";
import { usePortfolioData } from "@/providers/PortfolioProvider";
import { useEffect, useMemo, useState } from "react";

export function usePortfolio() {
  const { enrichedAssets, isLoading, addAsset, deleteAsset, stats, transactions, share, assets } = usePortfolioData();

  const [searchQuery, setSearchQuery] = useState<string>("");

  const { refreshData, ensureCoinsLoaded, coins, lastUpdated } = useCrypto()

  const { logout, user } = useAuth()

  const assetIds = useMemo(() => assets.map(a => a.id), [assets]);

  useEffect(() => {
    document.title = "My Portfolio | CryptoTracker";
  }, []);

  useEffect(() => {

    const initData = async () => {

      await refreshData()

      if (assetIds.length > 0) {
        ensureCoinsLoaded(assetIds);
      }
    }
    initData();

  }, [refreshData, ensureCoinsLoaded])

  const filteredAssets = useMemo(() => {
    return enrichedAssets
      .filter(a => a.id.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => a.id.localeCompare(b.id));
  }, [enrichedAssets, searchQuery]);

  const chartData = useMemo(() => {
    if (!enrichedAssets) return []

    const sorted = [...enrichedAssets].sort(
      (a, b) => b.totalValue - a.totalValue
    );

    const topAssets = sorted.slice(0, 5)

    const remainingAssets = sorted.slice(5)

    const othersValue = remainingAssets.reduce(
      (sum, asset) => sum + asset.totalValue, 0
    )

    const data = topAssets.map(asset => ({
      name: asset.id.toUpperCase(),
      value: asset.totalValue,
    }));

    if (othersValue > 0) {
      data.push({
        name: "Others",
        value: othersValue,
      });
    }

    return data

  }, [enrichedAssets]);




  return {
    assets: filteredAssets,
    transactions,
    lastUpdated,
    stats,
    share,
    chartData,
    coins,
    isLoading,
    addAsset,
    deleteAsset,
    logout, 
    user,
    searchQuery,
    setSearchQuery,
    totalBalance: stats.totalBalance,
    totalChange: stats.totalChange,
  };

}


