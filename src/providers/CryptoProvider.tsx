import { useState, useCallback, useRef, createContext, useContext, type ReactNode, useEffect } from "react";
import { fetchCoinGecko, apiGuards } from "@/services/api";
import type { Coin, SearchIndex } from "@/types/Coin";
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
    const [searchIndex, setSearchIndex] = useState<SearchIndex[]>([])
    const [isSearchIndexLoading, setIsSearchIndexLoading] = useState(true)

    const lastFetched = useRef<number>(0);
    const abortRef = useRef<AbortController | null>(null);
    const lastPageRef = useRef<number>(page)
    const coinsRef = useRef(coins)

    const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);


    useEffect(() => {
        fetchSearchIndex()
    }, [])

    useEffect(() => { coinsRef.current = coins }, [coins])

    useEffect(() => {
        return () => {
            if (errorTimeoutRef.current) {
                clearTimeout(errorTimeoutRef.current);
            }
        };
    }, []);

    const updateCoinsState = useCallback((incomingData: Coin[]) => {
        setCoins(prev => {
            const next = { ...prev };

            incomingData.forEach(coin => {
                next[coin.id] = coin;
            });

            return next;
        });

        if (page === 1) {
            setMarketList(incomingData)

        } else if (page > 1) {
            setMarketList(prev => {
                const existing = new Set(prev.map(c => c.id));
                const merged = [...prev];

                incomingData.forEach(coin => {
                    if (!existing.has(coin.id)) {
                        merged.push(coin);
                    }
                });

                return merged;
            });
        }

        setLastUpdated(Date.now());
    }, [page]);

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
        async <T,>(requestFn: () => Promise<T>): Promise<RequestResult<T>> => {

            const limit = apiGuards.canMakeRequest(lastFetched.current);

            if (!limit.allowed) {
                showError(`Limit! Wait ${limit.waitTime} s.`);
                return {
                    status: "rate_limit",
                    retryAfter: limit.waitTime ?? 5,
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

                showError(
                    error instanceof Error && error.message === "RATE_LIMIT"
                        ? "Too many requests"
                        : "Network error"
                );

                return { status: "error" };
            } finally {
                setIsLoading(false);
            }
        },
        [showError]
    );



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

            const result = await executeRequest<Coin[]>(async () => {
                const data = await fetchCoinGecko(
                    API_CONFIG.ENDPOINT,
                    { vs_currency: MARKET_CONFIG.DEFAULT_CURRENCY, ids: ids.join(",") },
                );

                updateCoinsState(data);
                return data as Coin[];
            });

            if (result.status === "success") {
                return result.data;
            }

            return [];
        },
        [executeRequest, updateCoinsState]
    );

    const fetchSearchIndex = useCallback(async () => {
        setIsSearchIndexLoading(true)

        try {
            const url = new URL(
                API_CONFIG.ENDPOINT,
                API_CONFIG.BASE_URL
            )

            url.search = new URLSearchParams({
                vs_currency: MARKET_CONFIG.DEFAULT_CURRENCY,
                per_page: "250",
            }).toString()

            const res = await fetch(url.toString())

            if (!res.ok) {
                throw new Error(`Search index failed: ${res.status}`)
            }

            const data = await res.json()
            setSearchIndex(data)
        } catch (err) {
            console.error("[SearchIndex]", err)
            showError("Search is temporarily unavailable", 3000)
        } finally {
            setIsSearchIndexLoading(false)
        }
    }, [showError])



    const ensureCoinsLoaded = useCallback(async (ids: string[]) => {

        if (!ids) return;

        const missingCoins = ids.filter(coin => {
            const inMain = coinsRef.current.hasOwnProperty(coin);
            const failed = failedIds.has(coin);

            return !inMain && !failed;
        });

        if (missingCoins.length === 0) return


        const result = await fetchExtraCoinsByIds(missingCoins);
        const returnedIds = new Set(result.map(c => c.id));

        const failed = missingCoins
            .map(a => a)
            .filter(id => !returnedIds.has(id));

        if (failed.length > 0) {
            setFailedIds(prev => {
                const next = new Set(prev);
                failed.forEach(id => next.add(id));
                return next;
            });
        }

    }, [failedIds, fetchExtraCoinsByIds])


    const resetApp = useCallback(() => {

        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setCoins({});
        setMarketList([])
        setPage(1)
        setError(null)
    }, [])

    const value: ICryptoContext = {
        coins,
        searchIndex,
        isLoading,
        error,
        marketList,
        page,
        isSearchIndexLoading,
        setPage,
        resetApp,
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