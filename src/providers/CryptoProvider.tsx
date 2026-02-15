import { useState, useCallback, useRef, createContext, useContext, type ReactNode, useEffect } from "react";
import { fetchCoinGecko, apiGuards } from "@/services/api";
import type { Coin } from "@/types/Coin";
import type { CryptoContext as ICryptoContext } from "@/types/CryptoContext";
import type { RequestResult } from "@/types/RequestResult";
import { CACHE_CONFIG, MARKET_CONFIG, API_CONFIG } from "@/configs/constants";

const CryptoContext = createContext<ICryptoContext | undefined>(undefined);

export default function CryptoProvider({ children }: { children: ReactNode }) {
    const [coins, setCoins] = useState<Record<string, Coin>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(1);
    const [lastUpdated, setLastUpdated] = useState<number | null>(null);
    const [failedIds, setFailedIds] = useState<Set<string>>(new Set());
    const [marketList, setMarketList] = useState<Coin[]>([])

    const lastFetched = useRef<number>(0);
    const abortRef = useRef<AbortController | null>(null);
    const lastPageRef = useRef<number>(page)
    const coinsRef = useRef(coins)
    const lastAttemptRef = useRef<number>(0);
    const marketListRef = useRef<Coin[]>(marketList);

    const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    
    const pendingRequests = useRef<Map<string, Promise<Coin[]>>>(new Map());
    
    const loadingCoins = useRef<Set<string>>(new Set());


    useEffect(() => { coinsRef.current = coins }, [coins])
    useEffect(() => { marketListRef.current = marketList }, [marketList])

    useEffect(() => {
        return () => {
            if (errorTimeoutRef.current) {
                clearTimeout(errorTimeoutRef.current);
            }
        };
    }, []);

    const updateCoinsState = useCallback((incomingData: Coin[]) => {
        const currentPage = lastPageRef.current;

        setCoins(prev => {
            const next = { ...prev };
            incomingData.forEach(coin => {
                next[coin.id] = coin;
            });
            return next;
        });

        setMarketList(prev => {
            if (currentPage === 1 && prev.length === 0) {
                return incomingData;
            }
            
            if (currentPage === 1 && prev.length > 0) {

                const updated = [...prev];
                incomingData.forEach(newCoin => {
                    const existingIndex = updated.findIndex(c => c.id === newCoin.id);
                    if (existingIndex >= 0) {
                        updated[existingIndex] = newCoin;
                    } else {
                        updated.push(newCoin);
                    }
                });

                return updated;
            }
            
            const existingIds = new Set(prev.map(c => c.id));
            const newUniqueCoins = incomingData.filter(c => !existingIds.has(c.id));
            return [...prev, ...newUniqueCoins];
        });

        setLastUpdated(Date.now());
    }, []);

    const showError = useCallback((message: string, timeout = 5000) => {
        setError(message);

        if (errorTimeoutRef.current) {
            clearTimeout(errorTimeoutRef.current);
        }

        errorTimeoutRef.current = setTimeout(() => {
            setError(null);
            errorTimeoutRef.current = null;
        }, timeout);
    }, []);

    const executeRequest = useCallback(
        async <T,>(requestFn: () => Promise<T>, retryCount = 0): Promise<RequestResult<T>> => {
            lastAttemptRef.current = Date.now();
            const limit = apiGuards.canMakeRequest(lastFetched.current);

            if (!limit.allowed) {
                const waitTime = limit.waitTime ?? 5;
                showError(`Rate limit - wait ${waitTime}s`);
                return {
                    status: "rate_limit",
                    retryAfter: waitTime,
                };
            }

            setIsLoading(true);

            try {
                const result = await requestFn();
                lastFetched.current = Date.now();

                return {
                    status: "success",
                    data: result,
                };
            } catch (error: unknown) {
                if (error instanceof Error && error.name === "AbortError") {
                    return { status: "aborted" };
                }

                if (error instanceof Error && error.message === "RATE_LIMIT") {
                    if (retryCount < 1) { 
                        const backoffTime = 3000; 

                        await new Promise(resolve => setTimeout(resolve, backoffTime));
                        return executeRequest(requestFn, retryCount + 1);
                    }
                    
                    showError("Rate limited - please wait a moment", 3000);
                } else {
                    showError("Network error");
                }

                return { status: "error" };
            } finally {
                setIsLoading(false);
            }
        },
        [showError]
    );



    const fetchMarketData = useCallback(async (force = false) => {
        const now = Date.now();
        const isFresh = lastUpdated && (now - lastUpdated < CACHE_CONFIG.MARKET_DATA_TTL);
        const isSamePage = page === lastPageRef.current;

        if (!force && lastAttemptRef.current && (now - lastAttemptRef.current < 3000)) {
            return;
        }

        if (isFresh && !force && isSamePage) {
            return;
        }


        await executeRequest(async () => {
            const params = {
                vs_currency: MARKET_CONFIG.DEFAULT_CURRENCY,
                per_page: MARKET_CONFIG.PER_PAGE.toString(),
                page: page.toString(),
            };
            const data = await fetchCoinGecko(API_CONFIG.ENDPOINT, params);
            updateCoinsState(data);
            lastPageRef.current = page;
        });
    }, [page, lastUpdated, updateCoinsState, executeRequest]);

    const fetchCoinById = useCallback(
        async (id: string): Promise<Coin | null> => {

            const result = await executeRequest<Coin | null>(async () => {
                const data = await fetchCoinGecko(
                    API_CONFIG.ENDPOINT,
                    { vs_currency: MARKET_CONFIG.DEFAULT_CURRENCY, ids: id },
                );

                if (data && data[0]) {
                    updateCoinsState(data);
                    return data[0];
                }

                return null;
            });

            if (result.status === "success") {
                return result.data;
            }

            return null;
        },
        [updateCoinsState, executeRequest]
    );

    const fetchExtraCoinsByIds = useCallback(
        async (ids: string[]): Promise<Coin[]> => {
            if (ids.length === 0) return [];
            
            const requestKey = ids.sort().join(',');
            
            const pending = pendingRequests.current.get(requestKey);
            if (pending) {
                return pending;
            }

            const requestPromise = executeRequest<Coin[]>(async () => {
                const data = await fetchCoinGecko(
                    API_CONFIG.ENDPOINT,
                    { vs_currency: MARKET_CONFIG.DEFAULT_CURRENCY, ids: ids.join(",") },
                );

                updateCoinsState(data);
                return data as Coin[];
            }).then(result => {
                pendingRequests.current.delete(requestKey);
                
                if (result.status === "success") {
                    return result.data;
                }
                return [];
            });
            pendingRequests.current.set(requestKey, requestPromise);
            
            return requestPromise;
        },
        [executeRequest, updateCoinsState]
    );

    const ensureCoinsLoaded = useCallback(async (ids: string[]) => {
        if (!ids || ids.length === 0) return;

        const coinsToLoad = ids.filter(id => {
            const exists = coinsRef.current.hasOwnProperty(id);
            const failed = failedIds.has(id);
            const loading = loadingCoins.current.has(id);
            return !exists && !failed && !loading;
        });

        if (coinsToLoad.length === 0) return;

        coinsToLoad.forEach(id => loadingCoins.current.add(id));

        try {
            const result = await fetchExtraCoinsByIds(coinsToLoad);
            const returnedIds = new Set(result.map(c => c.id));

            const failed = coinsToLoad.filter(id => !returnedIds.has(id));

            if (failed.length > 0) {
                setFailedIds(prev => {
                    const next = new Set(prev);
                    failed.forEach(id => next.add(id));
                    return next;
                });
            }
        } finally {
            coinsToLoad.forEach(id => loadingCoins.current.delete(id));
        }

    }, [failedIds, fetchExtraCoinsByIds])


    const resetApp = useCallback(() => {
        
        const hasData = marketListRef.current.length > 0;
        if (hasData) {
            return;
        }

        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setCoins({});
        setMarketList([])
        setPage(1)
        setError(null)

        pendingRequests.current.clear();
        loadingCoins.current.clear();
    }, [])

    const value: ICryptoContext = {
        coins,
        isLoading,
        error,
        marketList,
        page,
        setPage,
        resetApp,
        lastAttempt: lastAttemptRef.current,
        lastUpdated,
        executeRequest,
        refreshData: fetchMarketData,
        getCoinById: (id: string) => coins[id],
        fetchCoinById,
        ensureCoinsLoaded,
        fetchExtraCoinsByIds,

    };

    return <CryptoContext.Provider value={value}>{children}</CryptoContext.Provider>;
}

export const useCrypto = () => {
    const context = useContext(CryptoContext);
    if (!context) throw new Error("useCrypto must be used within Provider");
    return context;
};