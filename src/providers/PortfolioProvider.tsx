import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { PortfolioContext as IPortfolioContext } from "@/types/PortfolioContext";
import { useAuth } from "./AuthProvider";
import type { PortfolioAsset } from "@/types/PortfolioAsset";
import { arrayRemove, arrayUnion, collection, doc, onSnapshot, orderBy, query, Timestamp, updateDoc, where, writeBatch } from "firebase/firestore";
import { db } from "@/services/firebase";
import { useCrypto } from "./CryptoProvider";
import { toast } from "sonner";
import type { AssetsTransactions } from "@/types/TransactoionsAsset";

const PortfolioContext = createContext<IPortfolioContext | undefined>(undefined);

export default function PortfolioProvider({ children }: { children: React.ReactNode }) {

    const { user, isAuthenticated } = useAuth();
    const { coins } = useCrypto();
    const [assets, setAssets] = useState<PortfolioAsset[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [transactions, setTransactions] = useState<AssetsTransactions[]>([]);
    const [watchlist, setWatchlist] = useState<string[]>([])

    const isPriceLoading = assets.length > 0 && Object.keys(coins).length === 0;

    useEffect(() => {
        if (!isAuthenticated || !user) return;

        const userRef = doc(db, "users", user.id);

        const unsubscribe = onSnapshot(userRef, (docSnap) => {

            if (!docSnap.exists()) return

            const data = docSnap.data();
            setAssets(data.assets || []);
            setWatchlist(data.watchlist || [])
            setIsLoading(false);

        });

        return () => unsubscribe();

    }, [user?.id, isAuthenticated]);

    useEffect(() => {
        if (!isAuthenticated || !user) return;

        const q = query(collection(db, "transactions"), where("userId", "==", user.id), orderBy("timestamp", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const txs = snapshot.docs.map(doc => ({
                id: doc.id,
                userId: doc.data().userId,
                coinId: doc.data().coinId || "",
                type: doc.data().type || "buy",
                amount: doc.data().amount || 0,
                price: doc.data().price || 0,
                timestamp: doc.data().timestamp.toDate(),
            }));
            setTransactions(txs);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user?.id, isAuthenticated]);


    const enrichedAssets = useMemo(() => {
        if (!assets.length || !Object.keys(coins).length) return [];

        return assets.map(asset => {
            const coin = coins[asset.id];
            const currentPrice = coin?.current_price ?? 0;

            const invested = asset.amount * asset.buyPrice;
            const totalValue = asset.amount * currentPrice;
            const profitValue = totalValue - invested;
            const profitPercent =
                invested > 0 ? (profitValue / invested) * 100 : 0;

            return {
                ...asset,
                currentPrice,
                totalValue,
                invested,
                profitValue,
                profitPercent,
                priceChange: coin?.price_change_percentage_24h ?? 0,
                image: coin?.image,
                symbol: coin?.symbol,
                name: coin?.name
            };
        });
    }, [assets, coins]);


    const stats = useMemo(() => {
        const totalBalance = enrichedAssets.reduce(
            (sum, asset) => sum + asset.totalValue,
            0
        );

        const totalInvested = enrichedAssets.reduce(
            (sum, asset) => sum + asset.invested,
            0
        );

        const totalProfitValue = totalBalance - totalInvested;
        const totalProfitPercent = totalInvested > 0 ? (totalProfitValue / totalInvested) * 100 : 0;

        const totalChange = enrichedAssets.reduce(
            (sum, asset) =>
                sum + asset.totalValue * (asset.priceChange / 100),
            0
        );

        const previousBalance = totalBalance - totalChange;

        const totalChangePercent =
            previousBalance > 0
                ? (totalChange / previousBalance) * 100
                : 0;

        const bestPerformer = enrichedAssets.reduce((best, asset) => {
            return (best === null || asset.profitPercent > best.profitPercent) ? asset : best;
        }, null as (typeof enrichedAssets)[0] | null);

        const worstPerformer = enrichedAssets.reduce((worst, asset) => {
            return (worst === null || asset.profitPercent < worst.profitPercent) ? asset : worst;
        }, null as (typeof enrichedAssets)[0] | null);

        return {
            totalBalance,
            totalInvested,
            totalProfitValue,
            totalProfitPercent,
            totalChange,
            totalChangePercent,
            bestPerformer,
            worstPerformer,
            isProfit: totalProfitValue >= 0,
            isDailyProfit: totalChange >= 0
        };
    }, [enrichedAssets]);

    const share = useMemo(() => {
        const result: Record<string, number> = {};
        enrichedAssets.forEach(asset => {
            result[asset.id] = stats.totalBalance > 0 ? ((asset.amount * asset.currentPrice) / stats.totalBalance) * 100 : 0;
        });
        return result;
    }, [enrichedAssets, stats.totalBalance]);

    const addAsset = async (newAsset: PortfolioAsset) => {
        if (!user) return;

        const nextAssets = assets.some((a) => a.id === newAsset.id)
            ? assets.map((a) => {
                if (a.id === newAsset.id) {
                    const totalAmount = a.amount + newAsset.amount;
                    const avgPrice = ((a.amount * a.buyPrice) + (newAsset.amount * newAsset.buyPrice)) / totalAmount;
                    return { ...a, amount: totalAmount, buyPrice: avgPrice };
                }
                return a;
            })
            : [...assets, newAsset];
        try {
            const batch = writeBatch(db)
            const userRef = doc(db, "users", user.id)
            const txRef = doc(collection(db, "transactions"));

            batch.update(userRef, {
                assets: nextAssets,
            })
            batch.set(txRef, {
                userId: user.id,
                coinId: newAsset.id,
                amount: newAsset.amount,
                price: newAsset.buyPrice,
                type: "buy",
                timestamp: Timestamp.now(),
            })

            await batch.commit()

            setAssets(nextAssets);
            toast.success(`Added ${newAsset.id}`);

        } catch (e) {
            console.error(e);
            toast.error("Failed to add asset. Please try again.");
        }
    };

    const deleteAsset = async (id: string) => {
        if (!user) return;
        const asset = assets.find(a => a.id === id);
        if (asset) {
            const updatedAssets = assets.filter(a => a.id !== id);

            try {

                const batch = writeBatch(db)
                const userRef = doc(db, "users", user.id)
                const txRef = doc(collection(db, "transactions"));

                batch.update(userRef, {
                    assets: updatedAssets,
                })

                batch.set(txRef, {
                    userId: user.id,
                    coinId: id,
                    amount: asset.amount,
                    price: asset.buyPrice,
                    type: "sell",
                    timestamp: Timestamp.now(),
                })

                await batch.commit()
                setAssets(updatedAssets);
                toast.success(`Sold and removed ${id.toUpperCase()}`);
            } catch (e) {
                console.error(e);
                toast.error("Failed to remove asset. Please try again.");
                return;
            }
        }

    }

    const toggleWatchlist = async (coinId: string) => {

        if (!user) return

        const userRef = doc(db, "users", user.id)
        const exists = watchlist.includes(coinId);

        if (exists) {
            await updateDoc(userRef, {
                watchlist: arrayRemove(coinId),
            })
        }

        if (!exists) {
            await updateDoc(userRef, {
                watchlist: arrayUnion(coinId),
            })
        }

    }


    const value = {
        enrichedAssets,
        assets,
        transactions,
        isPriceLoading,
        stats,
        share,
        isLoading,
        watchlist,
        toggleWatchlist,
        addAsset,
        deleteAsset
    }

    return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
}

export const usePortfolioData = () => {
    const context = useContext(PortfolioContext);
    if (!context) throw new Error("usePortfolioData must be used within Provider");
    return context;
}