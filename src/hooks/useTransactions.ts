import { STORAGE_KEYS } from "@/configs/constants";
import type { AssetsTransactions, PortfolioAsset } from "@/types/PortfolioAsset";
import { useLocalStorage } from "./useLocalStorage";
import { useCallback } from "react";

export default function useTransactions() {
    const [transactions, setTransactions] = useLocalStorage<AssetsTransactions[]>(STORAGE_KEYS.TRANSACTIONS, []);

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