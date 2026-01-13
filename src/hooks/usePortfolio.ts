import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useLocalStorage } from "./useLocalStorage";
import type { Coin } from "@/types/Coin";
import type { PortfolioAsset } from "@/types/PortfolioAsset";
import { toast } from "sonner";
import type { AssetsTransactions } from "@/types/PortfolioAsset";

const globalStatus = {
  marketDataTime: 0,
  allCoinsTime: 0,
  isFetchingMarket: false,
  isFetchingAll: false,
};

export function usePortfolio() {
  const [assets, setAssets] = useLocalStorage<PortfolioAsset[]>("portfolio_assets", []);
  const [transactions, setTransactions] = useLocalStorage<AssetsTransactions[]>("assets_transactions", []);
  const [marketData, setMarketData] = useState<Coin[]>([]);
  const [allCoins, setAllCoins] = useState<Coin[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const assetIdsString = useMemo(() => assets.map(a => a.id).join(","), [assets]);

  const fetchMarketData = useCallback(async (force = false) => {
    if (!assetIdsString || globalStatus.isFetchingMarket) return;

    const now = Date.now();
    if (!force && now - globalStatus.marketDataTime < 60000 && marketData.length > 0) return;

    try {
      globalStatus.isFetchingMarket = true;
      setIsLoading(true);
      const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${assetIdsString}`);

      if (!response.ok) throw new Error(response.status === 429 ? 'Rate limit' : 'Fetch error');

      const data = await response.json();
      setMarketData(data);
      globalStatus.marketDataTime = Date.now();
      setError(null);
    } catch (err) {
      setError("API limits reached. Prices may be outdated.");
    } finally {
      setIsLoading(false);
      globalStatus.isFetchingMarket = false;
    }
  }, [assetIdsString, marketData.length]);

  const fetchAllCoins = useCallback(async (force = false) => {
    if (globalStatus.isFetchingAll) return;
    const now = Date.now();
    if (!force && now - globalStatus.allCoinsTime < 60000 && allCoins.length > 0) return;

    try {
      globalStatus.isFetchingAll = true;
      setIsLoading(true);
      const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1');
      if (!response.ok) throw new Error('Fetch error');
      const data = await response.json();
      setAllCoins(data);
      globalStatus.allCoinsTime = Date.now();
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
      globalStatus.isFetchingAll = false;
    }
  }, [allCoins.length]);

  useEffect(() => { fetchAllCoins(); }, [fetchAllCoins]);
  useEffect(() => { fetchMarketData(); }, [fetchMarketData]);

  const { totalBalance, totalCost } = useMemo(() => {
    let balance = 0, cost = 0;
    assets.forEach(asset => {
      const coin = marketData.find(c => c.id === asset.id) || allCoins.find(c => c.id === asset.id);
      balance += coin ? coin.current_price * asset.amount : 0;
      cost += asset.amount * asset.buyPrice;
    });
    return { totalBalance: balance, totalCost: cost };
  }, [assets, marketData, allCoins]);

  const enrichedAssets = useMemo(() => {
    return assets
      .filter(asset => asset.id.toLowerCase().includes(searchQuery.toLowerCase()))
      .map(asset => {

        const coin = marketData.find(c => c.id === asset.id) || allCoins.find(c => c.id === asset.id);
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
  }, [assets, marketData, allCoins, searchQuery, totalBalance]);

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

    setTimeout(() => fetchMarketData(true), 100);
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
    assets, isLoading, error, enrichedAssets, transactions, allCoins,
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
    refetch: (force = false) => Promise.all([fetchAllCoins(force), fetchMarketData(force)]),
  };
}