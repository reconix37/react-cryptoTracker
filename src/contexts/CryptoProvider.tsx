import type { Coin } from "@/types/Coin";
import type { CryptoContext } from "@/types/CryptoContext";
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

const CryptoContext = createContext<CryptoContext | undefined>(undefined);

export default function CryptoProvider({ children }: { children: ReactNode }) {
    const [coins, setCoins] = useState<Coin[]>([])
    const [isLoading, setisLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [page, setPage] = useState<number>(1)

    const lastFetched = useRef<number>(0);

    const updateCoinsState = useCallback((incomingData: Coin[]) => {
        setCoins(prev => {

            const updated = prev.map((item) => {
                const newData = incomingData.find((d: Coin) => d.id === item.id);
                return newData ? newData : item
            });

            const newItems = incomingData.filter(
                (newItem: Coin) => !prev.some(oldItem => oldItem.id === newItem.id)
            )

            return [...updated, ...newItems];
        })
    }, [])

    const fetchMarketData = useCallback(async (isAutoRefresh = false, customIds?: string[]) => {
        if (isAutoRefresh && Date.now() - lastFetched.current < 45000) return;

        const baseUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd`;

        
        const url = customIds && customIds.length > 0
            ? `${baseUrl}&ids=${customIds.join(',')}`
            : `${baseUrl}&order=market_cap_desc&per_page=50&page=${page}`;

        setisLoading(true)
        try {
            const response = await fetch(url)
            if (!response.ok) throw new Error('Fetch error');

            const incomingData = await response.json()
            updateCoinsState(incomingData)

            setLastUpdated(new Date)
            lastFetched.current = Date.now();
        } catch (error) {
            setError(error instanceof Error ? error.message : "Something went wrong");
        } finally {
            setisLoading(false)
        }

    }, [page, updateCoinsState])

    const fetchCoinById = useCallback(async (id: string, isAutoRefresh = false) => {
        if (isAutoRefresh && Date.now() - lastFetched.current < 45000) return;

        try {

            const respoonse = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${id}`)
            if (!respoonse.ok) throw new Error('Fetch error');

            const data = await respoonse.json()
            const coinData = data[0];

            if (!coinData) return;

            updateCoinsState(data)

            setLastUpdated(new Date)
            lastFetched.current = Date.now();

        } catch (error) {
            setError(error instanceof Error ? error.message : "Something went wrong");
        }


    }, [])

    const getCoinById = (id: string) => {
        const coinId = coins.find((c) => c.id === id)

        return coinId;
    }


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

    return (
        <CryptoContext.Provider value={value}>
            {children}
        </CryptoContext.Provider>
    );
}

export const useCrypto = () => {
    const context = useContext(CryptoContext);

    if (context === undefined) {
        throw new Error("useCrypto must be used within a CryptoProvider");
    }

    return context;
}

