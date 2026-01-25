import { useState, useCallback, useRef, createContext, useContext, type ReactNode } from "react";
import { fetchCoinGecko, apiGuards } from "@/services/api";
import type { Coin } from "@/types/Coin";
import type { CryptoContext as ICryptoContext } from "@/types/CryptoContext";
import { CACHE_CONFIG, MARKET_CONFIG, API_CONFIG } from "@/configs/constants";

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
    const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastPageRef = useRef<number>(page)


    const updateCoinsState = useCallback((incomingData: Coin[], currentPage: number) => {
        setCoins(prev => {
            if (currentPage === 1) return incomingData;
            const newItems = incomingData.filter(newItem => !prev.some(old => old.id === newItem.id));
            return [...prev, ...newItems];
        });
        setLastUpdated(Date.now());
    }, []);

    const executeRequest = useCallback(async <T,>(requestFn: () => Promise<T>) => {
        if (isFetching.current) return;

        const limit = apiGuards.canMakeRequest(lastFetched.current);
        if (!limit.allowed) {
            setError(`Limit! Wait ${limit.waitTime} s.`);

            clearTimeout(errorTimeoutRef.current!);
            errorTimeoutRef.current = setTimeout(
                () => setError(null),
                limit.waitTime ? limit.waitTime * 1000 : CACHE_CONFIG.DEFAULT_ERROR_DELAY
            );
            return;
        }

        if (abortController.current) abortController.current.abort();
        abortController.current = new AbortController();

        isFetching.current = true;
        setIsLoading(true);
        setError(null);

        try {
            const result = await requestFn();
            lastFetched.current = Date.now();
            return result
        } catch (err: any) {
            if (err.name === 'AbortError') return;
            setError(err.message === 'RATE_LIMIT' ? "Too many requests" : "Network error");
        } finally {
            setIsLoading(false);
            isFetching.current = false;
        }
    }, []);

    const fetchMarketData = useCallback(async (force = false) => {
        const isFresh = lastUpdated && (Date.now() - lastUpdated < CACHE_CONFIG.MARKET_DATA_TTL);
        const isSamePage = page === lastPageRef.current;

        if (isFresh && !force && isSamePage) {
            console.log("Using cache for page:", page);
            return;
        }

        await executeRequest(async () => {
            const params = {
                vs_currency: MARKET_CONFIG.DEFAULT_CURRENCY,
                per_page: MARKET_CONFIG.PER_PAGE.toString(),
                page: page.toString(),
            };
            const data = await fetchCoinGecko(API_CONFIG.ENDPOINT, params, abortController.current?.signal);
            updateCoinsState(data, page);
            lastPageRef.current = page;
        });
    }, [page, lastUpdated, updateCoinsState, executeRequest]);

    const fetchCoinById = useCallback(async (id: string) => {
        return await executeRequest(async () => {
            const data = await fetchCoinGecko(API_CONFIG.ENDPOINT, { vs_currency: MARKET_CONFIG.DEFAULT_CURRENCY, ids: id }, abortController.current?.signal);
            if (data && data[0]) {
                updateCoinsState(data, 1);
                return data[0];
            }
            return null;
        });
    }, [updateCoinsState, executeRequest]);

    const fetchExtraCoinsByIds = useCallback(
        async (ids: string): Promise<Coin[]> => {
            const result = await executeRequest(async () => {
                const data = await fetchCoinGecko(
                    API_CONFIG.ENDPOINT,
                    { vs_currency: MARKET_CONFIG.DEFAULT_CURRENCY, ids },
                    abortController.current?.signal
                );

                updateCoinsState(data, 1);
                return data as Coin[];
            });
            return result ?? [];
        },
        [executeRequest, updateCoinsState]
    );


    const resetApp = useCallback(() => {
        abortController.current?.abort();
        setCoins([])
        setPage(1)
        setError(null)
    }, [])

    const value: ICryptoContext = {
        coins,
        isLoading,
        error,
        page,
        setPage,
        resetApp,
        lastUpdated,
        refreshData: fetchMarketData,
        getCoinById: (id: string) => coins.find(c => c.id === id),
        fetchCoinById,
        fetchExtraCoinsByIds,
    };

    return <CryptoContext.Provider value={value}>{children}</CryptoContext.Provider>;
}

export const useCrypto = () => {
    const context = useContext(CryptoContext);
    if (!context) throw new Error("useCrypto must be used within Provider");
    return context;
};