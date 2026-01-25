import type { Coin } from "@/types/Coin";
import type { PortfolioAsset } from "@/types/PortfolioAsset";

export const enrichAssetData = (asset: PortfolioAsset, coin?: Coin, isLoading?: boolean) => {
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
        isPriceLoading: !coin && isLoading
    };
};

export const calculatePortfolioStats = (enrichedAssets: any[]) => {
    const totalBalance = enrichedAssets.reduce((acc, curr) => acc + curr.totalValue, 0);
    const totalCost = enrichedAssets.reduce((acc, curr) => acc + (curr.amount * curr.buyPrice), 0);

    const performingAssets = enrichedAssets.filter(a => a.currentPrice > 0 && a.profitPercent !== 0);
    const sorted = [...performingAssets].sort((a, b) => b.profitPercent - a.profitPercent);

    return {
        totalBalance,
        totalCost,
        totalProfit: totalBalance - totalCost,
        totalProfitPercent: totalCost > 0 ? ((totalBalance - totalCost) / totalCost) * 100 : 0,
        bestPerformer: sorted.length > 0 ? sorted[0] : null,
        worstPerformer: sorted.length > 0 ? sorted[sorted.length - 1] : null,
    };
};