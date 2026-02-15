import { useState, useEffect, useMemo, useRef } from "react";
import { useCrypto } from "@/providers/CryptoProvider";
import type { Coin } from "@/types/Coin";
import { usePortfolioData } from "@/providers/PortfolioProvider";
import { useCooldown } from "../../../globalHooks/useCoolDown";
import { useAuth } from "@/providers/AuthProvider";

export function useMarkets() {

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all" | "watchlist">("all");

    const { cooldown, startCooldown, isOnCooldown } = useCooldown(5);

    const { isLoading, error, coins, marketList, page, setPage, refreshData, resetApp, ensureCoinsLoaded } = useCrypto();
    const { watchlist, toggleWatchlist } = usePortfolioData()
    const { isAuthenticated } = useAuth()

    const hasLoadedRef = useRef(false);

    useEffect(() => {
        document.title = "Markets | CryptoTracker";
    }, []);

    useEffect(() => {
        const currentLength = marketList.length;
        
        if (currentLength >= 50) {
            hasLoadedRef.current = true;
            return;
        }
        
        if (!hasLoadedRef.current) {
            
            const timer = setTimeout(() => {
                if (marketList.length < 50) {
                    refreshData(true); 
                }
                hasLoadedRef.current = true;
            }, 100);

            return () => clearTimeout(timer);
        }
        
    }, [marketList.length]);

    useEffect(() => {
        if (page > 1) {
            refreshData();
        }
    }, [page]);

    useEffect(() => {
        if (filter !== "watchlist") return;
        if (watchlist.length === 0) return;

        ensureCoinsLoaded(watchlist);
    }, [filter, watchlist.length]);

    const finalDisplayCoins = useMemo(() => {
        const baseCoins: Coin[] =
            filter === "all"
                ? marketList
                : watchlist
                    .map((id) => coins[id])
                    .filter(Boolean);

        const normalizedSearch = search.toLowerCase();

        const filtered = baseCoins.filter((coin) =>
            coin.name.toLowerCase().includes(normalizedSearch) ||
            coin.symbol.toLowerCase().includes(normalizedSearch)
        );

        return filtered;

    }, [marketList, coins, filter, watchlist, search])


    const handleLoadMore = () => {
        if (isLoading || isOnCooldown) {
            return;
        }
        setPage((prev) => prev + 1);
        startCooldown();
    };

    const handleReset = () => {
        setSearch("")
        setFilter("all")
        hasLoadedRef.current = false;
        setPage(1);

        setTimeout(() => {
            refreshData(true);
            hasLoadedRef.current = true;
        }, 100);
    }

    const isEmpty = finalDisplayCoins.length === 0 && !isLoading;

    return {
        finalDisplayCoins,
        search,
        filter,
        cooldown,
        isOnCooldown,
        page,
        isLoading,
        watchlist,
        error,
        marketList,
        isEmpty,
        isAuthenticated,
        setSearch,
        setFilter,
        toggleWatchlist,
        handleLoadMore,
        setPage,
        resetApp,
        handleReset,
    };
}