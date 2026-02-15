import { AnimatedNumber } from "@/components/ui/AnimatedNumbers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/formatCurrency";
import { motion } from "framer-motion";
import FearGreedWidget from "./FearGreedWidget";
import TransactionHistory from "./TransactionHistory";
import PortfolioChart from "./PortfolioChart";
import { History, Wallet } from "lucide-react";
import type { PortfolioContext } from "@/types/PortfolioContext";
import type { AssetsTransactions } from "@/types/TransactoionsAsset";
import type { Coin } from "@/types/Coin";

interface PortfolioOverviewProps {
    stats: PortfolioContext['stats'];
    transactions: AssetsTransactions[];
    coins: Record<string, Coin>;
}

export default function PortfolioOverview({ stats, transactions, coins }: PortfolioOverviewProps) {
    return (
        <>
            <div className="grid gap-6 md:grid-cols-3">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <Card className="bg-card shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Total Balance</CardTitle>
                            <div className="p-2 bg-primary/10 rounded-lg"><Wallet className="h-4 w-4 text-primary" /></div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black">
                                <span className="text-primary mr-1">$</span>
                                <AnimatedNumber value={stats.totalBalance} />
                                <div
                                    className={cn(
                                        "flex items-center gap-1 text-sm font-medium mt-1",
                                        stats.isDailyProfit ? "text-emerald-500" : "text-rose-500"
                                    )}
                                >
                                    <span>{stats.isDailyProfit ? "▲" : "▼"}</span>
                                    <span>{formatCurrency(stats.totalChange)}</span>
                                    <span className="opacity-80">
                                        ({stats.totalChangePercent.toFixed(2)}%)
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <FearGreedWidget />

                    <div className="bg-card rounded-xl shadow-md border flex flex-col h-100">
                        <div className="p-4 border-b bg-muted/20 flex items-center gap-2 shrink-0">
                            <History className="h-4 w-4 text-primary" />
                            <h3 className="font-bold text-sm uppercase">Activity</h3>
                        </div>
                        <div className="overflow-y-auto grow">
                            <TransactionHistory transactions={transactions} allCoins={coins} />
                        </div>
                    </div>
                </motion.div>

                <motion.div className="md:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>

                    <div className="bg-card p-6 rounded-xl shadow-md border h-full min-h-[600px] flex items-center justify-center">
                        <PortfolioChart data={stats.allocation} />
                    </div>
                </motion.div>
            </div>
        </>
    )
}