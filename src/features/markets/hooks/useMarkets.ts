import { useState, useEffect, useMemo, useRef } from "react";
import { useCrypto } from "@/providers/CryptoProvider";
import type { Coin } from "@/types/Coin";
import { usePortfolioData } from "@/providers/PortfolioProvider";
import { useCooldown } from "../../../globalHooks/useCoolDown";
import { useAuth } from "@/providers/AuthProvider";
import type { SortConfig, SortKey } from "@/types/SortConfig";

export function useMarkets() {

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all" | "watchlist">("all");
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'marketCap', direction: 'desc' });

    const { cooldown, startCooldown, isOnCooldown } = useCooldown(5);

    const { isLoading, error, coins, marketList, page, setPage, refreshData, resetApp, ensureCoinsLoaded } = useCrypto();
    const { watchlist, toggleWatchlist } = usePortfolioData();
    const { isAuthenticated } = useAuth();

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

    const requestSort = (key: SortKey) => {
        setSortConfig(prev => {
            const newConfig = {
                key,
                direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
            } as SortConfig;
            return newConfig;
        });
    };

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
        const sorted = [...filtered].sort((a, b) => {
            let aValue: number | string;
            let bValue: number | string;

            switch (sortConfig.key) {
                case 'name':
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case 'price':
                    aValue = a.current_price;
                    bValue = b.current_price;
                    break;
                case 'change':
                    aValue = a.price_change_percentage_24h ?? 0;
                    bValue = b.price_change_percentage_24h ?? 0;
                    break;
                case 'marketCap':
                    aValue = a.market_cap ?? 0;
                    bValue = b.market_cap ?? 0;
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });

        return sorted;

    }, [marketList, coins, filter, watchlist, search, sortConfig]);


    const handleLoadMore = () => {
        if (isLoading || isOnCooldown) {
            return;
        }
        setPage((prev) => prev + 1);
        startCooldown();
    };

    const handleReset = () => {
        setSearch("");
        setFilter("all");
        setSortConfig({ key: 'marketCap', direction: 'desc' });
        hasLoadedRef.current = false;
        setPage(1);

        setTimeout(() => {
            refreshData(true);
            hasLoadedRef.current = true;
        }, 100);
    };

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
        sortConfig,
        setSearch,
        setFilter,
        toggleWatchlist,
        handleLoadMore,
        setPage,
        resetApp,
        handleReset,
        requestSort,
    };
}