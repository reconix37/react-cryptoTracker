import { useState, useEffect, useMemo, useRef } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { useCrypto } from "@/contexts/CryptoProvider";

export function useMarkets() {
    const [search, setSearch] = useState("");
    const [watchlist] = useLocalStorage<string[]>("watchlist", []);
    const [filter, setFilter] = useState<"all" | "watchlist">("all");

    const { isLoading, error, coins, page, setPage, refreshData } = useCrypto();
    const hasInitialized = useRef(false);
    const lastPageRef = useRef(1);

    useEffect(() => {
        if (!hasInitialized.current) {
            hasInitialized.current = true;
            console.log('Initial load');
            refreshData();
        }
    }, [refreshData]);

     useEffect(() => {
         if (page === 1 && hasInitialized.current) {
             const interval = setInterval(() => {
                 console.log('Auto-refresh');
                 refreshData(true);
             }, 300000); 
             return () => clearInterval(interval);
         }
     }, [page, refreshData]);

    useEffect(() => {
        if (!hasInitialized.current) return;

        if (page !== 1) {
            console.log('Resetting to page 1');
            lastPageRef.current = 1;
            setPage(1);
        }
    }, [filter, search]);

    useEffect(() => {
        if (!hasInitialized.current) return;
        if (page > lastPageRef.current) {
            console.log(`Loading page ${page}`);
            lastPageRef.current = page;
            refreshData();
        } else if (page < lastPageRef.current) {
            lastPageRef.current = page;
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