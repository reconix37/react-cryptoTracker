import { cn } from "@/lib/utils"
import { ArrowDownRight, ArrowUpRight, Trash2, Loader2 } from "lucide-react"
import type { Coin } from "@/types/Coin"
import type { AssetsTransactions } from "@/types/TransactoionsAsset";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { usePortfolioData } from "@/providers/PortfolioProvider";
import { useState } from "react";

interface TransactionHistoryProps {
    transactions: AssetsTransactions[];
    allCoins: Record<string, Coin>;
}

export default function TransactionHistory({ transactions, allCoins }: TransactionHistoryProps) {
    const { deleteTransaction, loadMoreTransactions, transactionsLoading, hasMoreTransactions } = usePortfolioData();
    const [deletingTxId, setDeletingTxId] = useState<string | null>(null);

    const handleDelete = async (txId: string) => {
        setDeletingTxId(txId);
        try {
            await deleteTransaction(txId);
        } finally {
            setDeletingTxId(null);
        }
    };

    const handleLoadMore = () => {
        if (!transactionsLoading && hasMoreTransactions) {
            loadMoreTransactions();
        }
    };

    if (transactions.length === 0) {
        return (
            <div className="p-8 text-center text-muted-foreground text-xs">
                No recent activity
            </div>
        )
    }

    return (
        <div>
            {transactions.map((transactionsItem) => {
                const coin = allCoins[transactionsItem.coinId];
                const isBuy = transactionsItem.type === "buy";
                const isDeleting = deletingTxId === transactionsItem.id;
                const isAnyDeleting = deletingTxId !== null;

                return (
                    <div
                        key={transactionsItem.id}
                        className={cn(
                            "grid grid-cols-[auto_1fr_auto_auto] gap-3 items-center p-4 border-b border-border last:border-0 transition-all",
                            isDeleting ? "opacity-50 pointer-events-none" : "hover:bg-muted/20",
                            "group"
                        )}
                    >
                        <div className="shrink-0">
                            {coin?.image ? (
                                <img src={coin.image} alt={coin.name} className="h-8 w-8 rounded-full" />
                            ) : (
                                <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-1">
                                <p className="font-bold uppercase text-sm truncate">
                                    {coin?.symbol || transactionsItem.coinId}
                                </p>
                                {isBuy ? (
                                    <ArrowUpRight className="h-3 w-3 text-emerald-500 shrink-0" />
                                ) : (
                                    <ArrowDownRight className="h-3 w-3 text-rose-500 shrink-0" />
                                )}
                            </div>
                            <p className="text-[10px] text-muted-foreground truncate">
                                {new Date(transactionsItem.timestamp).toDateString()}
                            </p>
                        </div>
                        <div className="text-right shrink-0">
                            <p className={cn(
                                "text-xs font-bold px-1.5 py-0.5 rounded inline-block",
                                isBuy ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                            )}>
                                {transactionsItem.type.toUpperCase()}
                            </p>
                            <p className="font-medium text-sm mt-1 whitespace-nowrap">
                                ${transactionsItem.price.toLocaleString()}
                            </p>
                        </div>
                        <div className="shrink-0">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        disabled={isAnyDeleting}
                                        className={cn(
                                            "text-destructive transition-opacity",
                                            isDeleting
                                                ? "opacity-100"
                                                : "sm:opacity-0 group-hover:opacity-100"
                                        )}
                                    >
                                        {isDeleting ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-5 w-5" />
                                        )}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
                                        <AlertDialogDescription asChild>
                                            <div className="space-y-3 text-left">
                                                <p>
                                                    This will remove this <strong className="text-foreground">{transactionsItem.type.toUpperCase()}</strong> transaction
                                                    of <strong className="text-foreground">{transactionsItem.amount.toLocaleString()} {coin?.symbol?.toUpperCase() || transactionsItem.coinId}</strong> at <strong className="text-foreground">${transactionsItem.price.toLocaleString()}</strong>.
                                                </p>

                                                {isBuy ? (
                                                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                                                        <p className="text-sm text-destructive font-medium">
                                                            ⚠️ Warning: Deleting a purchase transaction
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            If you have any sell transactions for this asset, make sure they don't exceed your remaining purchases, or this operation will be blocked.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-muted-foreground">
                                                        Your portfolio balance and average buy price will be recalculated using FIFO (First-In-First-Out) method.
                                                    </p>
                                                )}
                                            </div>
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleDelete(transactionsItem.id);
                                            }}
                                            disabled={isDeleting}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                            {isDeleting ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Deleting...
                                                </>
                                            ) : (
                                                "Delete Transaction"
                                            )}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                )
            })}
            {hasMoreTransactions && (
                <div className="p-4 flex justify-center border-t border-border">
                    <Button
                        variant="outline"
                        onClick={handleLoadMore}
                        disabled={transactionsLoading}
                        className="w-full max-w-xs"
                    >
                        {transactionsLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            "Load More Transactions"
                        )}
                    </Button>
                </div>
            )}
            {!hasMoreTransactions && transactions.length > 0 && (
                <div className="p-4 text-center text-muted-foreground text-xs border-t border-border">
                    No more transactions to load
                </div>
            )}
        </div>
    )
}