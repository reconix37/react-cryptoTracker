import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCrypto } from "@/providers/CryptoProvider";
import { usePortfolioData } from "@/providers/PortfolioProvider";
import { useAuth } from "@/providers/AuthProvider";
import { formatCompactNumber } from "@/utils/formatCompactNumber";

export function useCoinPages() {
    const { id } = useParams();

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    const { getCoinById, fetchCoinById, isLoading, error, marketList } = useCrypto();

    const {
        toggleWatchlist,
        watchlist,
        enrichedAssets,
        addAsset
    } = usePortfolioData()

    const { isAuthenticated } = useAuth();

    const coinDetails = id ? getCoinById(id) : undefined;

    const isInWatchlist = id ? watchlist.includes(id) : false

    useEffect(() => {
        if (id && !coinDetails) {
            fetchCoinById(id)
        }
    }, [id, coinDetails, fetchCoinById]);

    useEffect(() => {
        if (coinDetails) {
            document.title = `${coinDetails.name} (${coinDetails.symbol.toUpperCase()}) | CryptoTracker`;
        }

        return () => {
            document.title = "My Portfolio | CryptoTracker";
        };
    }, [coinDetails]);

    const myAsset = enrichedAssets.find((a) => a.id === id)

    return {
        coinDetails,
        error,
        isLoading,
        isInWatchlist,
        isAddDialogOpen,
        isAuthenticated,
        id,
        marketList, 
        myAsset,
        addAsset,
        toggleWatchlist,
        setIsAddDialogOpen,
        fetchCoinById,
        formatCompactNumber
    }
}