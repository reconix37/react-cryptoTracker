import { useState, useEffect, useMemo, useCallback, useRef } from "react"; // Добавили useRef
import { useLocalStorage } from "./useLocalStorage";
import type { Coin } from "@/types/Coin";
import { toast } from "sonner";

export function useMarkets() {
    const [coins, setCoins] = useState<Coin[]>([]);
    const [cache, setCache] = useLocalStorage<Coin[]>("markets_cache", []);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [watchlist] = useLocalStorage<string[]>("watchlist", []);
    const [filter, setFilter] = useState<"all" | "watchlist">("all");
    const [page, setPage] = useState(1);

    const fetchCoin = useCallback(async () => {
        try {
            if (page === 1 && coins.length === 0) setIsLoading(true);
            setError(null);

            const response = await fetch(
                `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=${page}`
            );

            if (!response.ok) {
                if (response.status === 429) throw new Error("Rate limit reached. Using offline data.");
                throw new Error("Network error");
            }

            const data = await response.json();
            
            setCoins(prev => {
                const newCoins = page === 1 ? data : [...prev, ...data];
                if (page === 1) setCache(data); 
                return newCoins;
            });

        } catch (error) {
             const message = error instanceof Error ? error.message : "Error";
             setError(message);
            if (coins.length === 0 && cache.length > 0) {
                setCoins(cache);
                toast.info("Showing cached data");
            }
        } finally {
            setIsLoading(false);
        }
    }, [page, cache.length]); 

    useEffect(() => {
        fetchCoin();
    }, [page]); 

    useEffect(() => {
        if (page === 1) {
            const interval = setInterval(() => {
                fetchCoin();
            }, 60000);
            return () => clearInterval(interval);
        }
    }, [page, fetchCoin]);

 
    const finalDisplayCoins = useMemo(() => {
        return coins
            .filter((coin) => (filter === "watchlist" ? watchlist.includes(coin.id) : true))
            .filter((coin) => 
                coin.name.toLowerCase().includes(search.toLowerCase()) || 
                coin.symbol.toLowerCase().includes(search.toLowerCase())
            );
    }, [coins, filter, watchlist, search]);

    return {
        finalDisplayCoins,
        search,
        filter,
        page,
        isLoading,
        watchlist,
        error,
        fetchCoin,
        setSearch,
        setFilter,
        setPage,
    };
}