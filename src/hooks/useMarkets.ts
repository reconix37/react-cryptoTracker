import { useState, useEffect, useMemo, useCallback, useRef } from "react"; // Добавили useRef
import { useLocalStorage } from "./useLocalStorage";
import type { Coin } from "@/types/Coin";
import { toast } from "sonner";

export function useMarkets() {
    const [coins, setCoins] = useState<Coin[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [watchlist] = useLocalStorage<string[]>("watchlist", []);
    const [filter, setFilter] = useState<"all" | "watchlist">("all");
    const [page, setPage] = useState(1);

    const isFetching = useRef(false);
    const lastFetched = useRef(0);

    const fetchCoin = useCallback(async (isAutoRefresh = false) => {
        if (isFetching.current) return;
        
        const now = Date.now();
        if (isAutoRefresh && now - lastFetched.current < 120000) return;

        try {
            isFetching.current = true;
            if (page === 1 && coins.length === 0) setIsLoading(true);
            
            const response = await fetch(
                `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=${page}`
            );

            if (!response.ok) throw new Error(response.status.toString());

            const data = await response.json();
            setCoins(prev => (page === 1 ? data : [...prev, ...data]));
            lastFetched.current = Date.now();
        } catch (error: any) {
            setError(error.message === "429" ? "Rate limit" : "Error");
        } finally {
            setIsLoading(false);
            isFetching.current = false;
        }
    }, [page]); 

    useEffect(() => {
        fetchCoin();
    }, [fetchCoin]);

    useEffect(() => {
        if (page === 1) {
            const interval = setInterval(() => fetchCoin(true), 120000);
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
