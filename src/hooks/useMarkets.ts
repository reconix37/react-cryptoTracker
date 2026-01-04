import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import type { Coin } from "@/types/Coin";

export function useMarkets() {
    const [coins, setCoins] = useState<Coin[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [watchlist] = useLocalStorage<string[]>("watchlist", []);
    const [filter, setFilter] = useState<"all" | "watchlist">("all");
    const [page, setPage] = useState(1)

    const visibleCoins = coins.filter((coin: Coin) => {
        if (filter === "watchlist") {
            return watchlist.includes(coin.id);
        }
        return true;
    });

    const finalDisplayCoins = useMemo(() => {
        return coins
            .filter((coin) => (filter === "watchlist" ? watchlist.includes(coin.id) : true))
            .filter((coin) => coin.name.toLowerCase().includes(search.toLowerCase()));
    }, [coins, filter, watchlist, search]);

    useEffect(() => {
        fetchCoin();

        if (page === 1) {
            const interval = setInterval(() => {
                fetchCoin();
            }, 60000);
            return () => clearInterval(interval);
        }

    }, [page]);

    useEffect(() => {
        document.title = `CryptoTracker | ${filter === 'all' ? 'Markets' : 'Watchlist'}`;
    }, [filter]);

    const fetchCoin = useCallback(async () => {
        try {
            if (page === 1 && coins.length === 0) setIsLoading(true);
            const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=${page}`);

            if (!response.ok) throw new Error("Network response was not ok");

            const data = await response.json();
            setCoins(prev => page === 1 ? data : [...prev, ...data]);
        } catch (error) {
            console.error("Error fetching coin data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [page]);

    return {
        fetchCoin,
        finalDisplayCoins,
        visibleCoins,
        search,
        setSearch,
        filter,
        setFilter,
        page,
        setPage,
        isLoading,
        coins,
        watchlist
    }
}