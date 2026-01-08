import { cn } from "@/lib/utils"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import type { AssetsTransactions } from "@/types/PortfolioAsset"
import type { Coin } from "@/types/Coin"

interface TransactionHistoryProps {
    transactions: AssetsTransactions[];
    allCoins: Coin[];
}

export default function TransactionHistory({ transactions, allCoins }: TransactionHistoryProps) {
    
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
                const coin = allCoins.find(c => c.id === transactionsItem.coinId)
                const isBuy = transactionsItem.type === "buy"
                
                return (
                    <div key={transactionsItem.id} className="flex items-center justify-between p-4 border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                        <div className="flex items-center gap-3">
                            {coin?.image ? (
                                <img src={coin.image} alt="" className="h-8 w-8 rounded-full" />
                            ) : (
                                <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
                            )}
                            
                            <div>
                                <div className="flex items-center gap-1">
                                    <p className="font-bold uppercase text-sm">
                                        {coin?.symbol || transactionsItem.coinId}
                                    </p>
                                    {isBuy ? (
                                        <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                                    ) : (
                                        <ArrowDownRight className="h-3 w-3 text-rose-500" />
                                    )}
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                    {new Date(transactionsItem.date).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className={cn(
                                "text-xs font-bold px-1.5 py-0.5 rounded inline-block",
                                isBuy ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                            )}>
                                {transactionsItem.type.toUpperCase()}
                            </p>
                            <p className="font-medium text-sm mt-1">
                                ${transactionsItem.buyPrice.toLocaleString()}
                            </p>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}