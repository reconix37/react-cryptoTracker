import type { Coin } from "./Coin";

export interface CryptoContext {
    
    coins: Coin[];
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;

    page: number | null;
    setPage(page: number): void;

    refreshData: () => Promise<void>;

    getCoinById: (id: string) => Coin | undefined;

    fetchCoinById: (id: string) => Promise<void>;
}