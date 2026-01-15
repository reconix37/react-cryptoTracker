import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import type { CoinDetails } from "../types/Coin";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { usePortfolio } from "./usePortfolio";

export function useCoinPages() {
    const { id } = useParams();
    const [coinDetails, setCoinDetails] = useState<CoinDetails | null>(null);
    const [watchlist, setWatchlist] = useLocalStorage<string[]>("watchlist", []);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const lastFetched = useRef(0);
    const { assets } = usePortfolio();

    const fetchCoinDetails = useCallback(async (coinId: string | undefined) => {
        if (!coinId || isLoading) return;

        const now = Date.now();
        if (now - lastFetched.current < 30000) return;

        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`);

            if (!response.ok) {
                if (response.status === 429) throw new Error("429");
                throw new Error("Failed to fetch");
            }

            const data = await response.json();
            setCoinDetails(data);
            setLastUpdated(new Date());
            lastFetched.current = Date.now();
        } catch (error: any) {
            setError(error.message === "429" ? "Rate limit reached" : "Error");
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchCoinDetails(id);
            const interval = setInterval(() => fetchCoinDetails(id), 120000);
            return () => clearInterval(interval);
        }
    }, [id, fetchCoinDetails]);

    const isInWatchlist = id ? watchlist.includes(id) : false;

    const toggleWatchlist = () => {
        if (!id) return;

        if (isInWatchlist) {
            setWatchlist(watchlist.filter(coin => coin !== id));
            toast.info(`${coinDetails?.name} removed from Watchlist`);
        } else {
            setWatchlist([...watchlist, id]);
            toast.success(`${coinDetails?.name} added from Watchlist`);
        }
    }

    const formatCompactNumber = (number: number) => {
        return Intl.NumberFormat("en-US", {
            notation: "compact",
            maximumFractionDigits: 2,
        }).format(number);
    };

    const myAsset = assets.find((a) => a.id === id)

    useEffect(() => {
        if (coinDetails) {
            document.title = `${coinDetails.name} (${coinDetails.symbol.toUpperCase()}) | CryptoTracker`;
        }

        return () => {
            document.title = "My Portfolio | CryptoTracker";
        };
    }, [coinDetails]);

    return {
        coinDetails,
        error,
        isLoading,
        isAddDialogOpen,
        id,
        myAsset,
        watchlist,
        isInWatchlist,
        lastUpdated,
        fetchCoinDetails,
        setIsAddDialogOpen,
        toggleWatchlist,
        formatCompactNumber
    }
}