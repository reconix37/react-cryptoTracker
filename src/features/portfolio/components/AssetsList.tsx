import { Input } from "@/components/ui/input";
import { CircleDollarSign, Search, Trash2 } from "lucide-react";
import PortfolioSkeleton from "./PortfolioSkeleton";
import { AnimatePresence, motion } from "framer-motion";
import { formatCurrency } from "@/utils/formatCurrency";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import type { EnrichedAsset } from "@/types/EnrichedAsset";
import type { Dispatch, SetStateAction } from "react";
import { Link } from "react-router-dom";


interface AssetsListProps {
    searchQuery: string,
    isLoading: boolean,
    assets: EnrichedAsset[],
    share: Record<string, number>,
    setSearchQuery: Dispatch<SetStateAction<string>>
    deleteAsset: (id: string) => void
}

export default function AssetsList({searchQuery, isLoading, assets, share, setSearchQuery, deleteAsset}:AssetsListProps) {
    return (
        <>
            <div className="bg-card rounded-2xl shadow-md border overflow-hidden">
                <div className="p-6 border-b bg-muted/30">
                    <h3 className="font-bold text-lg mb-4">Your Assets</h3>
                    <div className="relative">
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search coin..."
                            className="pl-10 rounded-xl"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                </div>

                <div className="divide-y">


                    {isLoading && assets.length === 0 &&
                        Array.from({ length: 5 }).map((_, i) => <PortfolioSkeleton key={i} />)
                    }

                    {!isLoading && assets.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground">
                            <CircleDollarSign className="mx-auto h-16 w-16 mb-4 opacity-10" />
                            <p>Your portfolio is empty.</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {assets.map((asset) => {
                                const isProfit = asset.profitPercent >= 0;
                                return (
                                    <motion.div
                                        key={asset.id}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-muted/50 group transition-all gap-4"
                                    >
                                        <Link to={`/coin/${asset.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className="relative shrink-0">
                                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-[10px] z-10 relative font-bold">
                                                    {asset.image ? (
                                                        <img src={asset.image} alt={asset.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-background z-10 relative" />
                                                    ) : (
                                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-[10px] z-10 relative font-bold">
                                                            {asset.symbol?.toUpperCase() || "?"}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-0.5 min-w-0">
                                                <p className="font-black uppercase truncate text-sm sm:text-base">{asset.name}</p> <span className="text-muted-foreground uppercase text-sm">{asset.symbol}</span>
                                                <p className="text-xs text-muted-foreground">{asset.amount.toLocaleString()} units</p>
                                                <div className="w-24 bg-muted h-1 rounded-full overflow-hidden mt-1">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${Math.min(share[asset.id] ?? 0, 100)}%` }}
                                                        className="bg-primary h-full"
                                                    />
                                                </div>
                                            </div>
                                        </Link>

                                        <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 w-full sm:w-auto border-t sm:border-0 pt-3 sm:pt-0">
                                            <div className="text-left sm:text-right">
                                                <div className="flex gap-2 justify-start sm:justify-end items-center">
                                                    <p className="font-bold text-base sm:text-lg">{formatCurrency(asset.totalValue)}</p>
                                                    <p
                                                        className={cn(
                                                            "text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded",
                                                            isProfit
                                                                ? "bg-emerald-500/10 text-emerald-500"
                                                                : "bg-rose-500/10 text-rose-500"
                                                        )}
                                                    >
                                                        {isProfit ? "+" : ""}
                                                        {asset.profitPercent.toFixed(2)}%
                                                    </p>
                                                </div>
                                                <p className="text-[10px] sm:text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded mt-1 inline-flex items-center gap-1.5">
                                                    <>
                                                        {formatCurrency(asset.currentPrice)}
                                                        <span className="opacity-70 ml-0.5">/ unit</span>
                                                    </>
                                                </p>
                                            </div>

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-destructive sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                                        <Trash2 className="h-5 w-5" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>This will remove {asset.id.toUpperCase()} and its history.</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                deleteAsset(asset.id);
                                                            }}
                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                        >
                                                            Remove
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </>
    )
}