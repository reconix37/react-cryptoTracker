import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { usePortfolio } from "./usePortfolio";
import { useCrypto } from "@/contexts/CryptoProvider";

export function useCoinPages() {
    const { id } = useParams();
    const [watchlist, setWatchlist] = useLocalStorage<string[]>("watchlist", []);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const { getCoinById, fetchCoinById, isLoading, error } = useCrypto();

    const { assets } = usePortfolio();

    const coinDetails = id ? getCoinById(id) : undefined;

    useEffect(() => {
        if (id && !coinDetails) {
            fetchCoinById(id)
        }
    }, [id, coinDetails]);
    
    useEffect(() => {
        if (coinDetails) {
            document.title = `${coinDetails.name} (${coinDetails.symbol.toUpperCase()}) | CryptoTracker`;
        }

        return () => {
            document.title = "My Portfolio | CryptoTracker";
        };
    }, [coinDetails]);

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


    return {
        coinDetails,
        error,
        isLoading,
        isAddDialogOpen,
        id,
        myAsset,
        watchlist,
        isInWatchlist,
        setIsAddDialogOpen,
        toggleWatchlist,
        fetchCoinById,
        formatCompactNumber
    }
}