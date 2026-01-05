import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button";
import CoinChart from "@/components/coins/CoinChart";
import { useCoinPages } from "@/hooks/useCoinPages";

export default function CoinPages() {
    const {
        coinDetails,
        id,
        isInWatchlist,
        toggleWatchlist,
        formatCompactNumber
    } = useCoinPages()

    if (!coinDetails) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

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
                            <img src={coinDetails.image.large} className="w-32 h-32" alt={coinDetails.name} />

                            <div className="flex-1 text-center md:text-left w-full">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                    <h1 className="text-4xl font-bold">
                                        {coinDetails.name} <span className="text-muted-foreground uppercase text-2xl ml-2">{coinDetails.symbol}</span>
                                    </h1>

                                    <button
                                        type="button"
                                        onClick={toggleWatchlist}
                                        className={`px-6 py-2 rounded-full font-semibold transition-all duration-200 cursor-pointer ${isInWatchlist
                                                ? "border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
                                                : "bg-yellow-500 text-white hover:bg-yellow-600 shadow-md"
                                            }`}
                                    >
                                        {isInWatchlist ? "In Watchlist ★" : "Add to Watchlist ☆"}
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                                    <div className="bg-secondary/50 p-4 rounded-xl border border-border/50">
                                        <p className="text-muted-foreground text-sm font-medium mb-1">Price</p>
                                        <p className="text-2xl font-bold">
                                            ${coinDetails.market_data.current_price.usd.toLocaleString()}
                                            <span className={coinDetails.market_data.price_change_percentage_24h > 0 ? "text-green-500 ml-2 text-base" : "text-red-500 ml-2 text-base"}>
                                                {coinDetails.market_data.price_change_percentage_24h > 0 ? "▲" : "▼"}
                                                {Math.abs(coinDetails.market_data.price_change_percentage_24h).toFixed(2)}%
                                            </span>
                                        </p>
                                    </div>
                                    <div className="bg-secondary/50 p-4 rounded-xl border border-border/50">
                                        <p className="text-muted-foreground text-sm font-medium mb-1">Market Cap</p>
                                        <p className="text-2xl font-bold">
                                            ${formatCompactNumber(coinDetails.market_data.market_cap.usd)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 bg-card rounded-2xl border border-border p-4 shadow-sm">
                            <CoinChart coinId={id} />
                        </div>
                        <div className="mt-8 p-2">
                            <h3 className="text-2xl font-semibold mb-4 border-b border-border pb-2">
                                About {coinDetails.name}
                            </h3>
                            <div
                                className="text-foreground/80 leading-relaxed text-lg 
                                    [&_a]:text-blue-500 [&_a]:hover:underline 
                                    [&_p]:mb-4"
                                dangerouslySetInnerHTML={{
                                    __html: coinDetails.description.en || "No description available."
                                }}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}