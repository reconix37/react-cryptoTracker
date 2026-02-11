import { formatCompactNumber } from "@/utils/formatCompactNumber";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Coin } from "@/types/Coin";
import { MarketTableSkeleton } from "./CoinTableSkeleton";

interface CoinTableProps {
    coins: Coin[];
    watchlist: string[];
    onToggleWatchlist: (id: string) => void;
    isLoading: boolean;
    isAuthenticated?: boolean;
    renderEmptyState?: () => React.ReactNode;
}


export default function CoinTable({ coins, watchlist, onToggleWatchlist, isLoading, renderEmptyState, isAuthenticated }: CoinTableProps) {

    const navigate = useNavigate();

    if (isLoading && coins.length === 0) {
        return <MarketTableSkeleton rows={12} />;
    }

    return (
        <Table className="w-full border border-border rounded-xl overflow-hidden">
            <TableHeader className="bg-secondary/50">
                <TableRow>
                    {isAuthenticated && <TableHead></TableHead>}
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>24h Change</TableHead>
                    <TableHead className="text-right hidden md:table-cell">
                        Market Cap
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {coins.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} className="h-40">
                            {renderEmptyState ? renderEmptyState() : null}
                        </TableCell>
                    </TableRow>
                ) : (
                    coins.map((coin) => (
                        <TableRow
                            key={coin.id}
                            onClick={() => navigate(`/coin/${coin.id}`)}
                            className="cursor-pointer transition-colors hover:bg-accent active:bg-accent/70"
                        >
                            {isAuthenticated &&
                                <TableCell className="pr-0">
                                    <Star
                                        className={cn(
                                            "w-5 h-5 md:w-6 md:h-6 pl-2 cursor-pointer transition-all",
                                            watchlist.includes(coin.id)
                                                ? "text-yellow-400 fill-yellow-400"
                                                : "text-muted-foreground hover:text-yellow-400"
                                        )}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onToggleWatchlist(coin.id);
                                        }}
                                    />
                                </TableCell>}

                            <TableCell className="flex items-center gap-3 font-medium">
                                <img
                                    src={coin.image}
                                    alt={coin.name}
                                    className="w-7 h-7 md:w-8 md:h-8 rounded-full"
                                />
                                <div className="leading-tight">
                                    <p className="text-sm md:text-base">{coin.name}</p>
                                    <p className="text-xs text-muted-foreground uppercase">
                                        {coin.symbol}
                                    </p>
                                </div>
                            </TableCell>


                            <TableCell>
                                ${coin.current_price.toLocaleString()}
                            </TableCell>
                            

                            <TableCell
                                className={
                                    coin.price_change_percentage_24h >= 0
                                        ? "text-green-500"
                                        : "text-red-500"
                                }
                            >
                                {coin.price_change_percentage_24h >= 0 ? "▲" : "▼"}
                                {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                            </TableCell>

                            <TableCell className="text-right hidden md:table-cell">
                                ${formatCompactNumber(coin.market_cap)}
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    )
}