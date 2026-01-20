import { useState, useCallback, useRef, createContext, useContext, type ReactNode } from "react";
import { fetchCoinGecko, apiGuards } from "@/services/api";
import type { Coin } from "@/types/Coin";
import type { CryptoContext as ICryptoContext } from "@/types/CryptoContext";

const CryptoContext = createContext<ICryptoContext | undefined>(undefined);

export default function CryptoProvider({ children }: { children: ReactNode }) {
    const [coins, setCoins] = useState<Coin[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(1);
    const [lastUpdated, setLastUpdated] = useState<number | null>(null);

    const lastFetched = useRef<number>(0);
    const isFetching = useRef(false);
    const abortController = useRef<AbortController | null>(null);

    const updateCoinsState = useCallback((incomingData: Coin[], currentPage: number) => {
        setCoins(prev => {
            if (currentPage === 1) return incomingData;
            const newItems = incomingData.filter(newItem => !prev.some(old => old.id === newItem.id));
            return [...prev, ...newItems];
        });
        setLastUpdated(Date.now());
    }, []);

    const executeRequest = useCallback(async (requestFn: () => Promise<void>) => {
        if (isFetching.current) return;
        
        const limit = apiGuards.canMakeRequest(lastFetched.current);
        if (!limit.allowed) {
            setError(`Limit! Wait ${limit.waitTime} s.`);
            return;
        }

        if (abortController.current) abortController.current.abort();
        abortController.current = new AbortController();

        isFetching.current = true;
        setIsLoading(true);
        setError(null);

        try {
            await requestFn();
            lastFetched.current = Date.now();
        } catch (err: any) {
            if (err.name === 'AbortError') return;
            setError(err.message === 'RATE_LIMIT' ? "Too many requests" : "Network error");
        } finally {
            setIsLoading(false);
            isFetching.current = false;
        }
    }, []);

    const fetchMarketData = useCallback(async () => {
        console.log("Fetching page:", page);
        await executeRequest(async () => {
            const params = {
                vs_currency: 'usd',
                per_page: '10',
                page: page.toString(),
            };
            const data = await fetchCoinGecko('coins/markets', params, abortController.current?.signal);
            updateCoinsState(data, page);
        });
    }, [page, updateCoinsState, executeRequest]);

    const fetchCoinById = useCallback(async (id: string) => {
        await executeRequest(async () => {
            const data = await fetchCoinGecko('coins/markets', { vs_currency: 'usd', ids: id }, abortController.current?.signal);
            if (data[0]) updateCoinsState(data, 1);
        });
    }, [updateCoinsState, executeRequest]);

    const value: ICryptoContext = {
        coins,
        isLoading,
        error,
        page,
        setPage,
        lastUpdated,
        refreshData: fetchMarketData,
        getCoinById: (id: string) => coins.find(c => c.id === id),
        fetchCoinById,
    };

    return <CryptoContext.Provider value={value}>{children}</CryptoContext.Provider>;
}

export const useCrypto = () => {
    const context = useContext(CryptoContext);
    if (!context) throw new Error("useCrypto must be used within Provider");
    return context;
};