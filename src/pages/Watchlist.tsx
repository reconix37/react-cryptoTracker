import CoinTable from "@/features/markets/components/CoinTable"
import { useCrypto } from "@/providers/CryptoProvider"
import { usePortfolioData } from "@/providers/PortfolioProvider"
import { motion } from "framer-motion"
import { Star } from "lucide-react"

export default function WatchList() {

    const { watchlist, toggleWatchlist, isLoading } = usePortfolioData()
    const { coins } = useCrypto()

    const watchlistCoins = watchlist.map(id => coins[id]).filter(Boolean)

    return (
        <div className="min-h-screen bg-background text-foreground p-4">
            <div className="max-w-5xl mx-auto flex flex-col gap-6">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight">My Watchlist</h1>
                    <p className="text-muted-foreground">
                        Coins you starred for quick access ⭐
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                >
                    <div className="bg-card border border-border rounded-2xl shadow-sm p-4">
                        <CoinTable
                            coins={watchlistCoins}
                            onToggleWatchlist={toggleWatchlist}
                            watchlist={watchlist}
                            isLoading={isLoading}
                            renderEmptyState={() => (
                                <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground py-12">
                                    <div className="rounded-full bg-secondary p-4">
                                        <Star className="w-10 h-10 opacity-50" />
                                    </div>
                                    <p className="text-lg font-medium">Your watchlist is empty</p>
                                    <p className="text-sm text-center max-w-sm">
                                        Browse the market and click the ⭐ icon to save coins here
                                    </p>
                                </div>
                            )}
                        />
                    </div>
                </motion.div>
            </div>
        </div>

    )
}