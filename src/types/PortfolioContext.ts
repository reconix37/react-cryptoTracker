import type { EnrichedAsset } from "@/types/EnrichedAsset";
import type { AssetsTransactions } from "./TransactoionsAsset";
import type { PortfolioAsset } from "./PortfolioAsset";
import type { AllocationItem } from "./AllcoationItem";

export interface PortfolioContext {
    enrichedAssets: EnrichedAsset[];
    transactions: AssetsTransactions[];
    assets: PortfolioAsset[];
    watchlist: string[];

    share: Record<string, number>;

    stats: {
        totalBalance: number;
        totalInvested: number;
        totalProfitValue: number;
        totalProfitPercent: number;
        totalChange: number;
        totalChangePercent: number;
        allocation: AllocationItem[];
        profitableAssetsCount: number;

        bestPerformer: EnrichedAsset | null;
        worstPerformer: EnrichedAsset | null;
        isProfit: boolean;
        isDailyProfit: boolean;
    }
    isPriceLoading: boolean;
    isLoading: boolean;

    addAsset: (newAsset: {
        id: string;
        amount: number;
        buyPrice: number;
    }) => void;

    deleteAsset: (id: string) => void;
    toggleWatchlist: (coinId: string) => void;
    deleteTransaction: (txId: string) => void;

    loadMoreTransactions: () => Promise<void>;
    transactionsLoading: boolean;
    hasMoreTransactions: boolean;
}
