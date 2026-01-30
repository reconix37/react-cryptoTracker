import { STORAGE_KEYS } from "@/configs/constants";
import type { AssetsTransactions, PortfolioAsset } from "@/types/PortfolioAsset";
import { useLocalStorage } from "./useLocalStorage";
import { useCallback } from "react";

export default function useTransactions(userId: string | null) {
    
    const userSpecificKey = userId ? `${STORAGE_KEYS.TRANSACTIONS}_${userId}` : STORAGE_KEYS.TRANSACTIONS;
    const [transactions, setTransactions] = useLocalStorage<AssetsTransactions[]>(userSpecificKey, []);

    const addTransaction = useCallback((
        asset: PortfolioAsset,
        type: "buy" | "sell",
        priceOverride?: number
    ) => {
        const newTransaction: AssetsTransactions = {
            ...asset,
            id: crypto.randomUUID(),
            coinId: asset.id,
            date: Date.now(),
            type,
            buyPrice: priceOverride ?? asset.buyPrice,
        };

        setTransactions(prev => [newTransaction, ...prev]);
    }, [setTransactions])

    return { transactions, addTransaction };
}