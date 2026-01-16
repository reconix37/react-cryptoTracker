import { useState, useEffect, useMemo} from "react";
import { useLocalStorage } from "./useLocalStorage";
import { useCrypto } from "@/contexts/CryptoProvider";

export function useMarkets() {
    const [search, setSearch] = useState("");
    const [watchlist] = useLocalStorage<string[]>("watchlist", []);
    const [filter, setFilter] = useState<"all" | "watchlist">("all");

    const { isLoading, error, coins, page, setPage, refreshData, } = useCrypto();

    useEffect(() => {
        refreshData()
    }, [])

    useEffect(() => {
        if (page === 1) {
            const interval = setInterval(() => refreshData(), 120000);
            return () => clearInterval(interval);
        }
    }, [page, refreshData]);

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
        refreshData,
        setSearch,
        setFilter,
        setPage,
    };
}
