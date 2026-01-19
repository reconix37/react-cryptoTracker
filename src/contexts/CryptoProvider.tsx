import type { Coin } from "@/types/Coin";
import type { CryptoContext } from "@/types/CryptoContext";
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

const CryptoContext = createContext<CryptoContext | undefined>(undefined);

const globalRequestQueue: number[] = [];
const RATE_LIMIT_MAX_REQUESTS = 8; 
const RATE_LIMIT_WINDOW = 60000;
const MIN_DELAY_BETWEEN_REQUESTS = 5000;

export default function CryptoProvider({ children }: { children: ReactNode }) {
    const [coins, setCoins] = useState<Coin[]>([])
    const [isLoading, setisLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [page, setPage] = useState<number>(1)

    const lastFetched = useRef<number>(0);
    const isFetching = useRef(false);
    const abortController = useRef<AbortController | null>(null);

    const updateCoinsState = useCallback((incomingData: Coin[], currentPage: number) => {
        setCoins(prev => {
            if (currentPage === 1) return incomingData;

            const newItems = incomingData.filter(
                (newItem) => !prev.some(oldItem => oldItem.id === newItem.id)
            );
            return [...prev, ...newItems];
        })
    }, []);

    const canMakeRequest = useCallback(() => {
        const now = Date.now();

        while (globalRequestQueue.length > 0 && now - globalRequestQueue[0] > RATE_LIMIT_WINDOW) {
            globalRequestQueue.shift();
        }

        if (globalRequestQueue.length >= RATE_LIMIT_MAX_REQUESTS) {
            const oldestRequest = globalRequestQueue[0];
            const timeToWait = Math.ceil((RATE_LIMIT_WINDOW - (now - oldestRequest)) / 1000);
            setError(`Rate limit reached. Wait ${timeToWait}s`);
            return false;
        }

        if (lastFetched.current > 0) {
            const timeSinceLastRequest = now - lastFetched.current;
            if (timeSinceLastRequest < MIN_DELAY_BETWEEN_REQUESTS) {
                const waitTime = Math.ceil((MIN_DELAY_BETWEEN_REQUESTS - timeSinceLastRequest) / 1000);
                setError(`Please wait ${waitTime}s before next request`);
                return false;
            }
        }

        return true;
    }, []);

    const fetchMarketData = useCallback(async (isAutoRefresh = false, customIds?: string[]) => {
        if (abortController.current) {
            abortController.current.abort();
        }
        if (isFetching.current) {
            console.log('Request already in progress, skipping...');
            return;
        }

        if (isAutoRefresh && Date.now() - lastFetched.current < 60000) {
            console.log('Auto-refresh too soon, skipping...');
            return;
        }

        if (!canMakeRequest()) {
            console.log('Rate limit hit, skipping...');
            return;
        }

        const baseUrl = `https://api.coingecko.com/api/v3/coins/markets`;
        const params = new URLSearchParams({
            vs_currency: 'usd',
            order: 'market_cap_desc',
            per_page: '10',
            page: page.toString(),
            sparkline: 'false',
            locale: 'en'
        });

        if (customIds && customIds.length > 0) {
            params.set('ids', customIds.join(','));
            params.delete('page');
        }

        const url = `${baseUrl}?${params.toString()}`;

        console.log(`Making request: page=${page}`);

        abortController.current = new AbortController();
        isFetching.current = true;
        setisLoading(true);
        setError(null);

        try {
            const requestTime = Date.now();
            globalRequestQueue.push(requestTime);
            lastFetched.current = requestTime;

            const response = await fetch(url, {
                signal: abortController.current.signal,
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            });

            console.log(`Response received: ${response.status}`);

            if (response.status === 429) {
                setError("API Rate Limit! Wait 1 minute and refresh page.");
                globalRequestQueue.length = 0;
                return;
            }

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const incomingData = await response.json();

            if (!Array.isArray(incomingData) || incomingData.length === 0) {
                throw new Error('Invalid data received');
            }

            updateCoinsState(incomingData, page);
            setLastUpdated(new Date());
            setError(null);
            console.log(`Data updated successfully: ${incomingData.length} coins`);

        } catch (err) {
            if (err instanceof Error) {
                if (err.name === 'AbortError') {
                    console.log('Request aborted');
                    return;
                }
                setError(`Error: ${err.message}`);
                console.error('Fetch error:', err);
            }
        } finally {
            setisLoading(false);
            isFetching.current = false;
            abortController.current = null;
        }
    }, [page, updateCoinsState, canMakeRequest]);

    const fetchCoinById = useCallback(async (id: string) => {
        if (!canMakeRequest()) return;

        try {
            const requestTime = Date.now();
            globalRequestQueue.push(requestTime);
            lastFetched.current = requestTime;

            const params = new URLSearchParams({
                vs_currency: 'usd',
                ids: id,
                sparkline: 'false',
                locale: 'en'
            });

            const response = await fetch(
                `https://api.coingecko.com/api/v3/coins/markets?${params.toString()}`,
                {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                    }
                }
            );

            if (response.status === 429) {
                setError("API Rate Limit!");
                return;
            }

            if (!response.ok) throw new Error('Fetch error');

            const data = await response.json();
            if (data[0]) updateCoinsState(data, 1);
        } catch (err) {
            console.error('fetchCoinById error:', err);
        }
    }, [updateCoinsState, canMakeRequest]);

    const getCoinById = useCallback((id: string) => {
        return coins.find((c) => c.id === id);
    }, [coins]);

    const value = {
        coins,
        isLoading,
        error,
        lastUpdated,
        page,
        setPage,
        refreshData: fetchMarketData,
        getCoinById,
        fetchCoinById,
    }

    return <CryptoContext.Provider value={value}>{children}</CryptoContext.Provider>;
}

export const useCrypto = () => {
    const context = useContext(CryptoContext);
    if (context === undefined) throw new Error("useCrypto must be used within a CryptoProvider");
    return context;
}