import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { Coin } from "@/types/Coin";
import type { CryptoContext } from "@/types/CryptoContext";
import type { PortfolioAsset } from "@/types/PortfolioAsset";
import { createContext, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

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
        const watchlistMap = watchlistCoins.map(a => a.id).join(",")
        const portfolioAssetsMap = portfolioAssets.map(a => a.id).join(",")
        
    }, [watchlistCoins, portfolioAssets]);


    const fetchMarketData = useCallback(async (isAutoRefresh = false) => {
        setisLoading(true)

        const now = Date.now();
        if (isAutoRefresh && now - lastFetched.current < 120000) return;

        try {
            const respoonse = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=${page}&sparkline=false`)
            if (!respoonse.ok) throw new Error('Fetch error');

            const data = await respoonse.json()
            setCoins(prev => (page === 1 ? data : [...prev, ...data]))
            setLastUpdated(new Date)

        } catch (error) {
            setError(error instanceof Error ? error.message : "Something went wrong");
        } finally {
            setisLoading(false)
        }

    }, [])

    const getCoinById = (id: string) => {
        const coinId = coins.find((c) => c.id === id)

        return coinId;
    }

    const value = {
        coins,
        page,
        lastUpdated,
        error,
        isLoading,
        getCoinById,

    }

    return (
        <CryptoContext.Provider value={value}>
            {children}
        </CryptoContext.Provider>
    );
}

