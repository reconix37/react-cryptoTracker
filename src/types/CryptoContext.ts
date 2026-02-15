import type { Coin } from "./Coin";
import type { RequestResult } from "./RequestResult";

export interface CryptoContext {
    coins: Record<string, Coin>;
    marketList: Coin[];
    isLoading: boolean;
    error: string | null;
    page: number;
    lastAttempt: number;
    lastUpdated: number | null;

    setPage: (page: number | ((prev: number) => number)) => void;
    resetApp: () => void;
    refreshData: (force?: boolean) => Promise<void>;
    getCoinById: (id: string) => Coin | undefined;
    fetchCoinById: (id: string) => Promise<Coin | null>;
    ensureCoinsLoaded: (ids: string[]) => Promise<void>;
    fetchExtraCoinsByIds: (ids: string[]) => Promise<Coin[]>;
    executeRequest: <T>(requestFn: () => Promise<T>, retryCount?: number) => Promise<RequestResult<T>>;
}