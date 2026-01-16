import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { Coin } from "@/types/Coin";
import type { CryptoContext } from "@/types/CryptoContext";
import type { PortfolioAsset } from "@/types/PortfolioAsset";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

const CryptoContext = createContext<CryptoContext | undefined>(undefined);

export default function CryptoProvider({ children }: { children: ReactNode }) {
    const [coins, setCoins] = useState<Coin[]>([])
    const [isLoading, setisLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [page, setPage] = useState<number>(1)
    const [watchlistCoins, setWatchlistCoins] = useLocalStorage<string[]>("watchlist", [])
    const [portfolioAssets, setPortfolioAssets] = useLocalStorage<PortfolioAsset[]>("portfolio_assets", [])

    const lastFetched = useRef<number>(0);

    const assetIdsString = useMemo(() => {
        const watchlistIds = watchlistCoins;
        const portfolioIds = portfolioAssets.map(asset => asset.id);
        const uniqueIds = new Set([...portfolioIds, ...watchlistIds]);
        return Array.from(uniqueIds).join(",");

    }, [watchlistCoins, portfolioAssets]);


    const fetchMarketData = useCallback(async (isAutoRefresh = false) => {
        if (isAutoRefresh && Date.now() - lastFetched.current < 45000) return;

        setisLoading(true)
        try {
            const respoonse = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=${page}&sparkline=false`)
            if (!respoonse.ok) throw new Error('Fetch error');

            const data = await respoonse.json()
            setCoins(prev => (page === 1 ? data : [...prev, ...data]))
            setLastUpdated(new Date)
            lastFetched.current = Date.now();

        } catch (error) {
            setError(error instanceof Error ? error.message : "Something went wrong");
        } finally {
            setisLoading(false)
        }

    }, [page])

    const fetchCoinById = useCallback(async (id: string, isAutoRefresh = false) => {
        if (isAutoRefresh && Date.now() - lastFetched.current < 45000) return;

        try {

            const respoonse = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${id}`)
            if (!respoonse.ok) throw new Error('Fetch error');

            const data = await respoonse.json()
            const coinData = data[0];

            if (!coinData) return;

            setCoins(prev => {
                const exists = prev.find(c => c.id === coinData.id);
                if (exists) {
                    return prev.map(c => c.id === coinData.id ? coinData : c);
                }
                return [...prev, coinData];
            })
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

