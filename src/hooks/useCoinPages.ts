import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import type { CoinDetails } from "../types/Coin";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { usePortfolio } from "./usePortfolio";

export function useCoinPages() {
    const { id } = useParams();
    const [coinDetails, setCoinDetails] = useState<CoinDetails | null>(null);
    const [watchlist, setWatchlist] = useLocalStorage<string[]>("watchlist", []);

    const { assets } = usePortfolio();

    const fetchCoinDetails = async (coinId: string | undefined) => {
        try {
            const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`);
            const data = await response.json();
            setCoinDetails(data);
        }
        catch (error) {
            console.error("Error fetching coin details:", error);
        }
    }

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

    useEffect(() => {
        fetchCoinDetails(id);

        const interval = setInterval(() => {
            fetchCoinDetails(id);
        }, 60000);

        return () => clearInterval(interval);

    }, [id]);

    const myAsset = assets.find((a) => a.id === id)

    return {
        coinDetails,
        id,
        myAsset,
        watchlist,
        isInWatchlist,
        toggleWatchlist,
        formatCompactNumber
    }
}