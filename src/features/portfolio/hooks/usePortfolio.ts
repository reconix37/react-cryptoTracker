import { useAuth } from "@/providers/AuthProvider";
import { useCrypto } from "@/providers/CryptoProvider";
import { usePortfolioData } from "@/providers/PortfolioProvider";
import { useEffect, useMemo, useState } from "react";

export function usePortfolio() {
  const {
    enrichedAssets,
    isLoading,
    addAsset,
    deleteAsset,
    stats,
    transactions,
    share
  } = usePortfolioData();

  const { coins, lastUpdated, marketList } = useCrypto();
  const { logout, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState<string>("");


  useEffect(() => {
    document.title = "My Portfolio | CryptoTracker";
  }, []);

  const filteredAssets = useMemo(() => {
    return enrichedAssets
      .filter(a => a.id.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => a.id.localeCompare(b.id));
  }, [enrichedAssets, searchQuery]);

  const chartData = useMemo(() => {
    if (!enrichedAssets.length) return [];

    const sorted = [...enrichedAssets].sort((a, b) => b.totalValue - a.totalValue);
    const topAssets = sorted.slice(0, 5);
    const remainingAssets = sorted.slice(5);

    const othersValue = remainingAssets.reduce((sum, asset) => sum + asset.totalValue, 0);

    const data = topAssets.map(asset => ({
      name: asset.symbol?.toUpperCase() || asset.id.toUpperCase(),
      value: asset.totalValue,
    }));

    if (othersValue > 0) {
      data.push({ name: "Others", value: othersValue });
    }

    return data;
  }, [enrichedAssets]);

  return {
    assets: filteredAssets,
    transactions,
    lastUpdated,
    stats,
    share,
    chartData,
    coins,
    marketList,
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