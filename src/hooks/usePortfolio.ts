import { useState, useEffect, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";
import type { Coin } from "@/types/Coin";
import type { PortfolioAsset } from "@/types/PortfolioAsset";
import { toast } from "sonner";

export function usePortfolio() {

  const [assets, setAssets] = useLocalStorage<PortfolioAsset[]>("portfolio_assets", []);
  const [marketData, setMarketData] = useState<Coin[]>([]);
  const [allCoins, setAllCoins] = useState<Coin[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchAllCoins = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1');
        const data = await response.json();
        setAllCoins(data);
      } catch (e) { console.error("Error fetching all coins:", e); }
    };
    fetchAllCoins();
  }, []);

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
      console.error("Error fetching portfolio market data:", error);
      toast.error("Failed to update prices. Check your connection.");
    }
  };

  useEffect(() => {
    fetchMarketData();
  }, [assets]);


  const totalBalance = useMemo(() => {
    return assets.reduce((acc, asset) => {
      const coin = marketData.find((c) => c.id === asset.id);
      return acc + (coin ? coin.current_price * asset.amount : 0);
    }, 0);
  }, [assets, marketData]);

  const totalCost = useMemo(() => {
    return assets.reduce((acc, a) => {
      return acc + (a.amount * a.buyPrice);
    }, 0);
  }, [assets])

  const totalProfitData = useMemo(() => {
    const profit = totalBalance - totalCost
    const percentage = totalCost > 0 ? (profit / totalCost) * 100 : 0

    return {
      profit,
      percentage,
      isProfit: profit >= 0
    };
  }, [totalBalance, totalCost])


  const chartData = useMemo(() => {
    return assets.map((asset) => {
      const coin = marketData.find((c) => c.id === asset.id);
      const price = coin ? Number(coin.current_price) : 0;
      const amount = Number(asset.amount);

      return {
        name: coin?.name || asset.id,
        value: price * amount
      };
    }).filter(item => item.value > 0);
  }, [assets, marketData]);

  const handleAddAsset = (newAsset: PortfolioAsset) => {
    setAssets((prev) => {
      const existingAsset = prev.find(a => a.id === newAsset.id);

      if (existingAsset) {
        return prev.map(a => {
          if (a.id === newAsset.id) {
            const totalAmount = a.amount + newAsset.amount;
            const averagePrice =
              ((a.amount * a.buyPrice) + (newAsset.amount * newAsset.buyPrice)) / totalAmount;

            return {
              ...a,
              amount: totalAmount,
              buyPrice: averagePrice
            };
          }
          return a;
        });
      }
      return [...prev, newAsset];
    });
    toast.success(`${newAsset?.id.toUpperCase()} added to your Assets`);
  };

  const handleDelete = (assetId: string) => {
    setAssets(prev => prev.filter(a => a.id !== assetId));
    toast.error(`${assetId.toUpperCase()} removed from portfolio`);
  };

  const filteredAssets = useMemo(() => {
    return assets.filter(asset =>
      asset.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [assets, searchQuery])

  return {
    assets,
    marketData,
    allCoins,
    totalBalance,
    chartData,
    totalCost,
    totalProfitData,
    searchQuery,
    filteredAssets,
    setSearchQuery,
    handleAddAsset,
    handleDelete
  };
}