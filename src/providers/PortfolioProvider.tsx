import { createContext, useContext, useEffect, useMemo, useState, useRef } from "react";
import type { PortfolioContext as IPortfolioContext } from "@/types/PortfolioContext";
import { useAuth } from "./AuthProvider";
import type { PortfolioAsset } from "@/types/PortfolioAsset";
import { arrayRemove, arrayUnion, collection, doc, onSnapshot, orderBy, query, runTransaction, Timestamp, updateDoc, where, writeBatch, limit, startAfter, getDocs, addDoc } from "firebase/firestore";
import { db } from "@/services/firebase";
import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { useCrypto } from "./CryptoProvider";
import { toast } from "sonner";
import type { AssetsTransactions } from "@/types/TransactoionsAsset";
import type { AllocationItem } from "@/types/AllcoationItem";
import { TRANSACTIONS_CONFIG } from "@/configs/constants";

const PortfolioContext = createContext<IPortfolioContext | undefined>(undefined);

export default function PortfolioProvider({ children }: { children: React.ReactNode }) {

    const { user, isAuthenticated } = useAuth();
    const { coins, ensureCoinsLoaded, } = useCrypto();
    const [assets, setAssets] = useState<PortfolioAsset[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [transactions, setTransactions] = useState<AssetsTransactions[]>([]);
    const [transactionsLastDoc, setTransactionsLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [transactionsLoading, setTransactionsLoading] = useState(false);
    const [hasMoreTransactions, setHasMoreTransactions] = useState(true);
    const [watchlist, setWatchlist] = useState<string[]>([])

    const loadingAssetsRef = useRef<Set<string>>(new Set());
    const lastSyncRef = useRef<number>(0);
    const lastSnapshotDateRef = useRef<string | null>(null);

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

        const q = query(collection(db, "transactions"), where("userId", "==", user.id), orderBy("timestamp", "desc"), limit(TRANSACTIONS_CONFIG.PAGE_SIZE));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (snapshot.empty) {
                setTransactions([]);
                setHasMoreTransactions(false);
                setIsLoading(false);
                return;
            }

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
            setTransactionsLastDoc(snapshot.docs[snapshot.docs.length - 1]);
            setHasMoreTransactions(snapshot.docs.length === TRANSACTIONS_CONFIG.PAGE_SIZE);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user?.id, isAuthenticated]);

    const loadMoreTransactions = async () => {
        if (!user || !transactionsLastDoc || transactionsLoading || !hasMoreTransactions) return;

        setTransactionsLoading(true);

        try {
            const q = query(
                collection(db, "transactions"),
                where("userId", "==", user.id),
                orderBy("timestamp", "desc"),
                startAfter(transactionsLastDoc),
                limit(TRANSACTIONS_CONFIG.PAGE_SIZE)
            );

            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                setHasMoreTransactions(false);
                return;
            }

            const newTxs = snapshot.docs.map(doc => ({
                id: doc.id,
                userId: doc.data().userId,
                coinId: doc.data().coinId || "",
                type: doc.data().type || "buy",
                amount: doc.data().amount || 0,
                price: doc.data().price || 0,
                timestamp: doc.data().timestamp.toDate(),
            }));

            setTransactions(prev => [...prev, ...newTxs]);
            setTransactionsLastDoc(snapshot.docs[snapshot.docs.length - 1]);
            setHasMoreTransactions(snapshot.docs.length === TRANSACTIONS_CONFIG.PAGE_SIZE);

        } catch (error) {
            console.error("Error loading more transactions:", error);
            toast.error("Failed to load more transactions");
        } finally {
            setTransactionsLoading(false);
        }
    };

    const assetIdsString = useMemo(() =>
        assets.map(a => a.id).sort().join(','),
        [assets]
    );

    useEffect(() => {
        if (!isAuthenticated || !user || !assetIdsString) return;

        const syncData = async () => {
            const now = Date.now();

            if (now - lastSyncRef.current < 5000) {
                return;
            }

            lastSyncRef.current = now;

            const idsArray = assetIdsString.split(',');

            const missingIds = idsArray.filter(id => {
                const notInCoins = !coins[id];
                const notCurrentlyLoading = !loadingAssetsRef.current.has(id);
                return notInCoins && notCurrentlyLoading;
            });

            if (missingIds.length > 0) {
                missingIds.forEach(id => loadingAssetsRef.current.add(id));

                try {
                    await ensureCoinsLoaded(missingIds);
                } finally {
                    missingIds.forEach(id => loadingAssetsRef.current.delete(id));
                }
            }
        };

        syncData();

    }, [isAuthenticated, user?.id, assetIdsString]);


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

    const totalBalance = useMemo(() => {
        return enrichedAssets.reduce(
            (sum, asset) => sum + asset.totalValue,
            0
        );
    }, [enrichedAssets]);

    const allocation = useMemo<AllocationItem[]>(() => {
        if (!enrichedAssets.length || totalBalance === 0) return [];

        const sorted = [...enrichedAssets].sort(
            (a, b) => b.totalValue - a.totalValue
        );

        const top = sorted.slice(0, 5);
        const rest = sorted.slice(5);

        const othersValue = rest.reduce(
            (sum, asset) => sum + asset.totalValue,
            0
        );

        const result: AllocationItem[] = top.map(asset => ({
            id: asset.id,
            name: asset.name ?? asset.id,
            value: asset.totalValue,
            percent: (asset.totalValue / totalBalance) * 100,
        }));

        if (othersValue > 0) {
            result.push({
                id: "others",
                name: "Others",
                value: othersValue,
                percent: (othersValue / totalBalance) * 100,
            });
        }

        return result;
    }, [enrichedAssets, totalBalance]);

    const profitableAssetsCount = useMemo(() => {
        return enrichedAssets.filter(a => a.profitValue > 0).length;
    }, [enrichedAssets]);

    const stats = useMemo(() => {

        const totalInvested = enrichedAssets.reduce(
            (sum, asset) => sum + asset.invested,
            0
        );

        const totalProfitValue = totalBalance - totalInvested;
        const totalProfitPercent =
            totalInvested > 0 ? (totalProfitValue / totalInvested) * 100 : 0;

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

        const profitableAssets = enrichedAssets.filter(
            asset => asset.profitValue > 0
        );

        const losingAssets = enrichedAssets.filter(
            asset => asset.profitValue < 0
        );

        const bestPerformer = profitableAssets.length > 0
            ? profitableAssets.reduce((best, asset) =>
                asset.profitValue > best.profitValue ? asset : best,
                profitableAssets[0]
            )
            : null;

        const worstPerformer = losingAssets.length > 0
            ? losingAssets.reduce((worst, asset) =>
                asset.profitValue < worst.profitValue ? asset : worst,
                losingAssets[0]
            )
            : null;


        return {
            totalBalance,
            totalInvested,
            totalProfitValue,
            totalProfitPercent,
            totalChange,
            profitableAssetsCount,
            totalChangePercent,
            allocation,
            bestPerformer,
            worstPerformer,
            isProfit: totalProfitValue >= 0,
            isDailyProfit: totalChange >= 0,
        };
    }, [enrichedAssets, totalBalance, allocation, profitableAssetsCount]);

    const share = useMemo(() => {
        const result: Record<string, number> = {};
        enrichedAssets.forEach(asset => {
            result[asset.id] = stats.totalBalance > 0 ? ((asset.amount * asset.currentPrice) / stats.totalBalance) * 100 : 0;
        });
        return result;
    }, [enrichedAssets, stats.totalBalance]);

    useEffect(() => {
        if (!isAuthenticated || !user) return;
        if (isPriceLoading || enrichedAssets.length === 0) return;

        const createDailySnapshot = async () => {
            try {
                const today = new Date();
                today.setUTCHours(0, 0, 0, 0);
                const todayString = today.toISOString().split('T')[0];

                if (lastSnapshotDateRef.current === todayString) {
                    return;
                }

                const q = query(
                    collection(db, "portfolio_history"),
                    where("userId", "==", user.id),
                    where("timestamp", ">=", Timestamp.fromDate(today))
                );

                const snapshot = await getDocs(q);

                if (snapshot.empty) {
                    await addDoc(collection(db, "portfolio_history"), {
                        userId: user.id,
                        totalBalance: stats.totalBalance,
                        timestamp: Timestamp.now(),
                    });

                    lastSnapshotDateRef.current = todayString;
                }
            } catch (error) {
                console.error("Failed to create portfolio snapshot:", error);
            }
        };

        createDailySnapshot();
    }, [isAuthenticated, user?.id, stats.totalBalance, isPriceLoading, enrichedAssets.length]);


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
                toast.error("Failed to remove asset. Please try again.");
                return;
            }
        }

    }

    const toggleWatchlist = async (coinId: string) => {

        if (!user) return

        const userRef = doc(db, "users", user.id)
        const exists = watchlist.includes(coinId);

        const previousWatchlist = watchlist;

        const updatedWatchlist = exists ? watchlist.filter(id => id !== coinId) : [...watchlist, coinId]

        setWatchlist(updatedWatchlist)

        try {
            await updateDoc(userRef, {
                watchlist: exists
                    ? arrayRemove(coinId)
                    : arrayUnion(coinId),
            });
        } catch (error) {
            setWatchlist(previousWatchlist);
        }
    }

    const deleteTransaction = async (txId: string) => {
        if (!user) return;

        const txToDelete = transactions.find(tx => tx.id === txId);
        if (!txToDelete) {
            toast.error("Transaction not found");
            return;
        }

        const coinId = txToDelete.coinId;
        const isSellTx = txToDelete.type === 'sell';


        const toastId = toast.loading("Removing transaction...");

        try {

            await runTransaction(db, async (transaction) => {

                const userRef = doc(db, "users", user.id);
                const userDoc = await transaction.get(userRef);

                if (!userDoc.exists()) {
                    throw new Error("User document not found");
                }

                const currentAssets = (userDoc.data().assets || []) as PortfolioAsset[];

                const txQuery = query(
                    collection(db, "transactions"),
                    where("userId", "==", user.id),
                    where("coinId", "==", coinId),
                    orderBy("timestamp", "asc")
                );

                const txSnapshot = await getDocs(txQuery);
                const allCoinTxs = txSnapshot.docs.map(doc => ({
                    id: doc.id,
                    type: doc.data().type as "buy" | "sell",
                    amount: doc.data().amount,
                    price: doc.data().price,
                }));

                const remainingTxs = allCoinTxs.filter(tx => tx.id !== txId);

                if (isSellTx) {
                    const { finalAmount, finalBuyPrice } = calculateFIFO(remainingTxs);

                    const txRef = doc(db, "transactions", txId);
                    transaction.delete(txRef);

                    if (finalAmount <= 0) {
                        const updatedAssets = currentAssets.filter(a => a.id !== coinId);
                        transaction.update(userRef, { assets: updatedAssets });
                    } else {
                        const updatedAssets = currentAssets.map(a =>
                            a.id === coinId
                                ? { ...a, amount: finalAmount, buyPrice: finalBuyPrice }
                                : a
                        );
                        transaction.update(userRef, { assets: updatedAssets });
                    }

                    return;
                }

                const validation = validateFIFO(remainingTxs);

                if (!validation.valid) {
                    throw new Error(
                        `Cannot delete this purchase: It would create an invalid state where ` +
                        `${validation.conflictingSell?.amount} ${coinId.toUpperCase()} was sold ` +
                        `without sufficient prior purchases. Please delete the sell transaction first.`
                    );
                }
                const { finalAmount, finalBuyPrice } = calculateFIFO(remainingTxs);

                const txRef = doc(db, "transactions", txId);
                transaction.delete(txRef);

                if (finalAmount <= 0) {
                    const updatedAssets = currentAssets.filter(a => a.id !== coinId);
                    transaction.update(userRef, { assets: updatedAssets });
                } else {
                    const updatedAssets = currentAssets.map(a =>
                        a.id === coinId
                            ? { ...a, amount: finalAmount, buyPrice: finalBuyPrice }
                            : a
                    );
                    transaction.update(userRef, { assets: updatedAssets });
                }
            });

            toast.success("Transaction removed", { id: toastId });

        } catch (error: any) {

            if (error.message.includes("Cannot delete this purchase")) {
                toast.error(error.message, {
                    id: toastId,
                    duration: 6000
                });
            } else {
                toast.error("Failed to remove transaction. Please try again.", {
                    id: toastId
                });
            }
        }
    };

    function calculateFIFO(txs: Array<{ type: string; amount: number; price: number }>) {
        let runningBalance = 0;
        const purchases: Array<{ amount: number; price: number }> = [];

        for (const tx of txs) {
            if (tx.type === 'buy') {
                runningBalance += tx.amount;
                purchases.push({ amount: tx.amount, price: tx.price });
            } else {
                let sellAmount = tx.amount;
                runningBalance -= sellAmount;

                while (sellAmount > 0 && purchases.length > 0) {
                    const oldest = purchases[0];

                    if (oldest.amount <= sellAmount) {
                        sellAmount -= oldest.amount;
                        purchases.shift();
                    } else {
                        oldest.amount -= sellAmount;
                        sellAmount = 0;
                    }
                }
            }
        }

        const finalCostBasis = purchases.reduce(
            (sum, p) => sum + p.amount * p.price,
            0
        );
        const finalBuyPrice = runningBalance > 0 ? finalCostBasis / runningBalance : 0;

        return {
            finalAmount: runningBalance,
            finalBuyPrice,
        };
    }

    function validateFIFO(txs: Array<{ type: string; amount: number; price: number }>) {
        let runningBalance = 0;

        for (const tx of txs) {
            if (tx.type === 'buy') {
                runningBalance += tx.amount;
            } else {
                if (runningBalance < tx.amount) {
                    return {
                        valid: false,
                        conflictingSell: tx,
                    };
                }
                runningBalance -= tx.amount;
            }
        }

        return { valid: true };
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
        deleteAsset,
        deleteTransaction,
        loadMoreTransactions,
        transactionsLoading,
        hasMoreTransactions,
    }

    return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
}

export const usePortfolioData = () => {
    const context = useContext(PortfolioContext);
    if (!context) throw new Error("usePortfolioData must be used within Provider");
    return context;
}