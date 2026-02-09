import type { Coin, SearchIndex } from "./Coin";
import type { RequestResult } from "./RequestResult";

export interface CryptoContext {

    coins: Record<string, Coin>;
    isLoading: boolean;
    error: string | null;
    lastUpdated: number | null;
    marketList: Coin[];
    searchIndex: SearchIndex[];
    isSearchIndexLoading: boolean;

    page: number;
    setPage: React.Dispatch<React.SetStateAction<number>>;

    resetApp: () => void;

    refreshData: (isAutoRefresh?: boolean, customIds?: string[]) => Promise<void>;

    getCoinById: (id: string) => Coin | undefined;

    fetchCoinById: (id: string) => Promise<Coin | null>;

    fetchExtraCoinsByIds(ids: string[]): Promise<Coin[]>

    ensureCoinsLoaded: (ids: string[]) => Promise<void>;

    executeRequest: <T>(requestFn: () => Promise<T>) => Promise<RequestResult<T>>;
}