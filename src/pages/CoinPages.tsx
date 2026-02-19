import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button";
import CoinChart from "@/features/markets/components/CoinChart";
import { useCoinPages } from "@/features/markets/hooks/useCoinPages";
import { PlusIcon, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/ui/AnimatedNumbers";
import AddAssetDialog from "@/features/markets/components/AddAssetDialog";

export default function CoinPages() {
    const {
        coinDetails,
        error,
        marketList,
        isLoading,
        isInWatchlist,
        id,
        myAsset,
        isAddDialogOpen,
        isAuthenticated,
        addAsset,
        setIsAddDialogOpen,
        formatCompactNumber,
        toggleWatchlist,
        fetchCoinById
    } = useCoinPages()

    const handleAddWatchlist = () => {
        if (coinDetails?.id) {
            toggleWatchlist(coinDetails.id)
        }
    }


    if (isLoading && !coinDetails) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    if (error && !coinDetails) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <div className="text-center space-y-2">
                    <p className="text-destructive font-bold text-xl">Oops! Something went wrong</p>
                    <p className="text-muted-foreground">{error}</p>
                </div>
                <Button onClick={() => id && fetchCoinById(id)}>
                    Try again
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            <div className="max-w-4xl mx-auto p-6">
                <Link to="/" className="mb-6 inline-block">
                    <Button variant="outline" className="cursor-pointer border-border hover:bg-accent text-foreground">
                        ← Back to assets
                    </Button>
                </Link>

                {coinDetails && (
                    <>
                        <div className="bg-card text-card-foreground rounded-2xl shadow-sm border border-border p-8 flex flex-col md:flex-row gap-8 items-center md:items-start">
                            {coinDetails.image && (
                                <img src={coinDetails.image} className="w-32 h-32" alt={coinDetails.name} />
                            )}

                            <div className="flex-1 text-center md:text-left w-full">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                    <h1 className="text-4xl font-bold">
                                        {coinDetails.name} <span className="text-muted-foreground uppercase text-4xl ml-2">{coinDetails.symbol}</span>
                                    </h1>
                                    {isAuthenticated ? (
                                        <button
                                            type="button"
                                            onClick={handleAddWatchlist}
                                            className={cn(
                                                "px-6 py-2 rounded-lg font-semibold transition-all duration-200 cursor-pointer",
                                                isInWatchlist
                                                    ? "border-2 border-primary text-primary hover:bg-primary/10"
                                                    : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                                            )}
                                        >
                                            {isInWatchlist ? "★ In Watchlist" : "☆ Add to Watchlist"}
                                        </button>
                                    ) : (
                                        <Link to="/auth">
                                            <Button variant="outline" className="cursor-pointer border-border hover:bg-accent text-foreground">
                                                Login to add to watchlist
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                                    <div className="bg-secondary/50 p-4 rounded-xl border border-border/50 relative">
                                        <p className="text-muted-foreground text-sm font-medium mb-1">
                                            Price
                                            {error === "Network error" && (
                                                <span className="text-[10px] text-destructive animate-pulse">
                                                    Offline
                                                </span>
                                            )}
                                        </p>

                                        <div className={cn(
                                            "transition-opacity duration-500",
                                            error === "Network error" ? "opacity-50" : "opacity-100"
                                        )}>
                                            <p className="text-2xl font-bold">
                                                ${coinDetails.current_price.toLocaleString()}
                                                <span className={coinDetails.price_change_percentage_24h > 0 ? "text-green-500 ml-2 text-base" : "text-red-500 ml-2 text-base"}>
                                                    {coinDetails.price_change_percentage_24h > 0 ? "▲" : "▼"}
                                                    {Math.abs(coinDetails.price_change_percentage_24h).toFixed(2)}%
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-secondary/50 p-4 rounded-xl border border-border/50">
                                        <p className="text-muted-foreground text-sm font-medium mb-1">Market Cap</p>
                                        <p className="text-2xl font-bold">
                                            ${formatCompactNumber(coinDetails.market_cap)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 bg-card rounded-2xl border border-border p-4 shadow-sm">
                            <CoinChart coinId={id} />
                        </div>
                        {isAuthenticated ? (
                            <>
                                {myAsset && (
                                    <div className="mt-8 overflow-hidden bg-card border border-primary/20 rounded-2xl shadow-sm relative">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                                        <div className="p-6">
                                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                                <Wallet className="h-5 w-5 text-primary" />
                                                Your Portfolio Position
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                                                <div className="space-y-1">
                                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Holdings</p>
                                                    <p className="text-2xl font-black">
                                                        {myAsset.amount.toLocaleString()} <span className="text-sm font-medium text-muted-foreground">{coinDetails.symbol.toUpperCase()}</span>
                                                    </p>
                                                    <p className="text-sm font-medium text-primary">
                                                        ≈ ${(myAsset.amount * coinDetails.current_price).toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Purchase Price</p>
                                                    <p className="text-2xl font-black">
                                                        <span className="text-primary mr-1">$</span>
                                                        <AnimatedNumber value={myAsset.buyPrice} />
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">Average per unit</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Profit / Loss</p>
                                                    <div className={cn(
                                                        "text-2xl font-black flex items-center gap-2",
                                                        (myAsset.profitValue) >= 0 ? "text-emerald-500" : "text-rose-500"
                                                    )}>
                                                        <span>{(myAsset.profitValue) >= 0 ? "+" : ""}$</span>
                                                        <AnimatedNumber value={myAsset.profitValue} />
                                                    </div>
                                                    <p className={cn(
                                                        "text-sm font-bold flex items-center gap-1",
                                                        (myAsset.profitValue) >= 0 ? "text-emerald-500/80" : "text-rose-500/80"
                                                    )}>
                                                        {(myAsset.profitValue) >= 0 ? "▲" : "▼"} {myAsset.profitPercent.toFixed(2)}%
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {!myAsset && (
                                    <div className="mt-8 p-8 border-2 border-dashed border-muted rounded-2xl flex flex-col items-center text-center gap-4">
                                        <div className="p-4 bg-muted rounded-full">
                                            <PlusIcon className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold">Not in your portfolio</h3>
                                            <p className="text-muted-foreground">
                                                You don't own any {coinDetails.name} yet.
                                                Add it to track your potential profits!
                                            </p>
                                        </div>
                                        <Button onClick={() => setIsAddDialogOpen(true)}>
                                            Add {coinDetails.symbol.toUpperCase()} to Portfolio
                                        </Button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="mt-8 p-8 border-2 border-dashed border-primary/30 rounded-2xl flex flex-col items-center text-center gap-4 bg-primary/5">
                                <div className="p-4 bg-primary/10 rounded-full">
                                    <Wallet className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Sign in to manage your portfolio</h3>
                                    <p className="text-muted-foreground">
                                        Create an account to add {coinDetails.name} to your portfolio and start tracking your investments.
                                    </p>
                                </div>
                                <Link to="/auth" className="w-full">
                                    <Button className="w-full">
                                        Sign in to your account
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </div>
            <AddAssetDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                preselectedAssetId={id}
                marketData={marketList}
                onAdd={(data) => {
                    addAsset(data);
                    setIsAddDialogOpen(false);
                }}
                isLoading={false}
            />
        </div>
    )
}