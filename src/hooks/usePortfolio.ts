import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useLocalStorage } from "./useLocalStorage";
import type { Coin } from "@/types/Coin";
import type { PortfolioAsset } from "@/types/PortfolioAsset";
import { toast } from "sonner";
import type { AssetsTransactions } from "@/types/PortfolioAsset";

export function usePortfolio() {
  const [assets, setAssets] = useLocalStorage<PortfolioAsset[]>("portfolio_assets", []);
  const [transactions, setTransactions] = useLocalStorage<AssetsTransactions[]>("assets_transactions", []);
  const [marketData, setMarketData] = useState<Coin[]>([]);
  const [allCoins, setAllCoins] = useState<Coin[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastFetched = useRef(0)


  const fetchMarketData = useCallback(async () => {
    setError("")

    if (assets.length === 0) return;
    const ids = assets.map((a) => a.id).join(",");

    try {
      setIsLoading(true)

      const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}`);
      if (!response.ok) throw new Error('Not found or too many requrests')
      const data = await response.json();

      setMarketData(data);

      lastFetched.current = Date.now();

    } catch (error) {
      console.error("Error fetching portfolio market data:", error);
      setError(error instanceof Error ? error.message : "Something went wrong")
    }
  }, []);

  const fetchAllCoins = useCallback(async () => {
    try {
      setError("")
      setIsLoading(true)
      const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1');
      if (!response.ok) throw new Error('Not found or too many requrests')
      const data = await response.json();
      setAllCoins(data);
    } catch (e) {
      console.error("Error fetching all coins:", e);
      setError(e instanceof Error ? e.message : "Something went wrong")
    }
  }, []);

  useEffect(() => {
    fetchAllCoins();
  }, []);

  useEffect(() => {
    fetchMarketData();
  }, [assets]);

  const { totalBalance, totalCost } = useMemo(() => {
    let balance = 0;
    let cost = 0;
    assets.forEach(asset => {
      const coin = marketData.find(c => c.id === asset.id);
      balance += coin ? coin.current_price * asset.amount : 0;
      cost += asset.amount * asset.buyPrice;
    });
    return { totalBalance: balance, totalCost: cost };
  }, [assets, marketData]);

  const totalProfitData = useMemo(() => {
    const profit = totalBalance - totalCost;
    return {
      profit,
      percentage: totalCost > 0 ? (profit / totalCost) * 100 : 0,
      isProfit: profit >= 0
    };
  }, [totalBalance, totalCost]);

  const enrichedAssets = useMemo(() => {
    return assets
      .filter(asset => asset.id.toLowerCase().includes(searchQuery.toLowerCase()))
      .map(asset => {
        const coin = marketData.find(c => c.id === asset.id);
        const currentPrice = coin?.current_price || 0;
        const value = currentPrice * asset.amount;
        const profit = (currentPrice - asset.buyPrice) * asset.amount;

        return {
          ...asset,
          name: coin?.name || asset.id,
          symbol: coin?.symbol || "",
          image: coin?.image || "",
          currentPrice,
          totalValue: value,
          profit,
          profitPercent: asset.buyPrice > 0 ? ((currentPrice - asset.buyPrice) / asset.buyPrice) * 100 : 0,
          share: totalBalance > 0 ? (value / totalBalance) * 100 : 0,
          isProfit: profit >= 0
        };
      })
      .sort((a, b) => b.totalValue - a.totalValue);
  }, [assets, marketData, searchQuery, totalBalance]);

  const bestPerformer = useMemo(() =>
    enrichedAssets.length > 0 ? [...enrichedAssets].sort((a, b) => b.profitPercent - a.profitPercent)[0] : null
    , [enrichedAssets]);

  const worstPerformer = useMemo(() =>
    enrichedAssets.length > 0 ? [...enrichedAssets].sort((a, b) => a.profitPercent - b.profitPercent)[0] : null
    , [enrichedAssets]);

  const chartData = useMemo(() =>
    enrichedAssets.map(a => ({ name: a.name, value: a.totalValue })).filter(v => v.value > 0)
    , [enrichedAssets]);

  const addTransactionRecord = (data: Omit<AssetsTransactions, "id" | "date">) => {
    const newTransaction: AssetsTransactions = {
      ...data,
      id: crypto.randomUUID(),
      date: Date.now(),
    };
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const handleAddAsset = (newAsset: PortfolioAsset) => {
    setAssets((prev) => {
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
    addTransactionRecord({ coinId: newAsset.id, amount: newAsset.amount, buyPrice: newAsset.buyPrice, type: "buy" });
    toast.success(`${newAsset.id.toUpperCase()} added`);
  };

  const handleDelete = (id: string) => {
    const asset = assets.find(a => a.id === id);
    if (asset) {
      const current = marketData.find(c => c.id === id);
      addTransactionRecord({ coinId: id, amount: asset.amount, buyPrice: current?.current_price || asset.buyPrice, type: "sell" });
      setAssets(prev => prev.filter(a => a.id !== id));
      toast.error(`${id.toUpperCase()} removed`);
    }
  };

  const refetch = async (force = false) => {
    const now = Date.now();

    if (!force && now - lastFetched.current < 60000) {
      console.log("Too early for update, skipping...");
      return;
    }
    setError(null)
    setIsLoading(true)

    try {
      await Promise.all([fetchAllCoins(), fetchMarketData()]);
    } finally {
      setIsLoading(false);
    }
  }

  return {
    assets,
    isLoading,
    error,
    enrichedAssets,
    transactions,
    bestPerformer,
    worstPerformer,
    allCoins,
    totalBalance,
    chartData,
    totalProfitData,
    searchQuery,
    refetch,
    setSearchQuery,
    handleAddAsset,
    handleDelete
  };
}