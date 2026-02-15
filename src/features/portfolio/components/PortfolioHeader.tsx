import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddAssetDialog from "@/features/markets/components/AddAssetDialog";
import type { Coin } from "@/types/Coin";
import type { User } from "@/types/User";
import { motion } from "framer-motion";
import { Wallet } from "lucide-react";

interface PortfolioHeaderProps {
    lastUpdated: number | null;
    addAsset: (newAsset: {
        id: string;
        amount: number;
        buyPrice: number;
    }) => void;
    formatted: string;
    marketData: Coin[];
    logout: () => void;
    isLoading: boolean;
    user: User | null
}

export default function PortfolioHeader({
    lastUpdated,
    formatted,
    logout,
    addAsset,
    marketData,
    isLoading,
    user
}: PortfolioHeaderProps) {
    return (
        <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Portfolio</h1>
                    <p className="text-muted-foreground mb-2">
                        {lastUpdated
                            ? `Last updated: ${formatted}`
                            : "Track your crypto assets and performance."}
                    </p>
                    <Button variant={"outline"} onClick={logout} className="mt-2 w-full">Log out</Button>
                </div>
                <AddAssetDialog
                    onAdd={addAsset}
                    marketData={marketData}
                    isLoading={isLoading}
                />
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <Card className="bg-gradient-to-br from-card to-card/50 shadow-md border border-primary/10">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Wallet className="h-5 w-5 text-primary" />
                            </div>
                            Account Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-3 rounded-lg bg-muted/40 border border-border/50 hover:border-primary/30 transition-colors">
                                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wide mb-1">Email</p>
                                <p className="text-sm font-semibold text-foreground break-all">{user?.email}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-muted/40 border border-border/50 hover:border-primary/30 transition-colors">
                                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wide mb-1">Username</p>
                                <p className="text-sm font-semibold text-foreground">{user?.userName}</p>
                            </div>
                        </div>
                        {user?.name && (
                            <div className="p-3 rounded-lg bg-muted/40 border border-border/50 hover:border-primary/30 transition-colors">
                                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wide mb-1">Full Name</p>
                                <p className="text-sm font-semibold text-foreground">{user.name}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

        </>
    )
}