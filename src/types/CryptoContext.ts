import type { Coin } from "./Coin";

export interface CryptoContext {
    
    coins: Coin[];
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;

    page: number;
    setPage: React.Dispatch<React.SetStateAction<number>>;

    refreshData: (isAutoRefresh?: boolean, customIds?: string[]) => Promise<void>;

    getCoinById: (id: string) => Coin | undefined;

    fetchCoinById: (id: string) => Promise<void>;
}