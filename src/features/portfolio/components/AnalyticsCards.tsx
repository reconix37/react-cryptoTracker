import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { EnrichedAsset } from "@/types/EnrichedAsset";
import type { PortfolioContext } from "@/types/PortfolioContext";
import { formatCurrency } from "@/utils/formatCurrency";

interface AnalyticsCardsProps {
    stats: PortfolioContext['stats'];
    assets: EnrichedAsset[];
}

export default function AnalyticsCards({ stats, assets }: AnalyticsCardsProps) {
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm uppercase text-muted-foreground">
                            Biggest Profit
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats.bestPerformer ? (
                            <div className="flex items-center gap-3">
                                <img
                                    src={stats.bestPerformer?.image ?? undefined}
                                    alt={stats.bestPerformer?.name ?? "Asset"}
                                    className="w-8 h-8 rounded-full"
                                />

                                <div>
                                    <p className="font-bold">{stats.bestPerformer.name}</p>
                                    <p className="text-emerald-500 font-semibold">
                                        +{formatCurrency(stats.bestPerformer.profitValue)}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm">No profits yet</p>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm uppercase text-muted-foreground">
                            Biggest Loss
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats.worstPerformer ? (
                            <div className="flex items-center gap-3">
                                <img
                                    src={stats.worstPerformer?.image ?? undefined}
                                    alt={stats.worstPerformer?.name ?? "Asset"}
                                    className="w-8 h-8 rounded-full"
                                />

                                <div>
                                    <p className="font-bold">{stats.worstPerformer.name}</p>
                                    <p className="text-rose-500 font-semibold">
                                        {formatCurrency(stats.worstPerformer.profitValue)}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm">No losses</p>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm uppercase text-muted-foreground">
                            Portfolio Health
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className={cn("text-lg font-bold", stats.totalProfitPercent > 0 ? "text-emerald-500" : "text-rose-500")}>
                            {stats.totalProfitPercent.toFixed(2)}%
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {stats.profitableAssetsCount} / {assets.length} assets in profit
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}