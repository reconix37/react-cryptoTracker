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
import { Star, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Coin } from "@/types/Coin";
import { MarketTableSkeleton } from "./CoinTableSkeleton";
import type { SortDirection, SortKey } from "@/types/SortConfig";

interface CoinTableProps {
    coins: Coin[];
    watchlist: string[];
    onToggleWatchlist: (id: string) => void;
    isLoading: boolean;
    isAuthenticated?: boolean;
    renderEmptyState?: () => React.ReactNode;
    sortConfig?: { key: SortKey; direction: SortDirection };
    onSort?: (key: SortKey) => void;
}

export default function CoinTable({ 
    coins, 
    watchlist, 
    onToggleWatchlist, 
    isLoading, 
    renderEmptyState, 
    isAuthenticated,
    sortConfig,
    onSort
}: CoinTableProps) {

    const navigate = useNavigate();

    if (isLoading && coins.length === 0) {
        return <MarketTableSkeleton rows={12} />;
    }

    const getSortIcon = (columnKey: SortKey) => {
        if (sortConfig?.key !== columnKey) {
            return <ArrowUpDown className="w-3 h-3 opacity-30" />;
        }
        return sortConfig.direction === 'asc' 
            ? <ArrowUp className="w-3 h-3 text-blue-600" />
            : <ArrowDown className="w-3 h-3 text-blue-600" />;
    };

    return (
        <div className="w-full">
            <Table className="hidden sm:table w-full border border-border rounded-xl overflow-hidden">
                <TableHeader className="bg-secondary/50">
                    <TableRow>
                        {isAuthenticated && <TableHead className="w-12"></TableHead>}

                        <TableHead className="p-0">
                            <div
                                onClick={() => onSort?.('name')}
                                className={cn(
                                    "px-4 py-3 flex items-center gap-2 select-none",
                                    onSort && "cursor-pointer hover:bg-secondary transition-colors active:bg-secondary/80"
                                )}
                            >
                                Name
                                {onSort && getSortIcon('name')}
                            </div>
                        </TableHead>

                        <TableHead className="p-0">
                            <div
                                onClick={() => onSort?.('price')}
                                className={cn(
                                    "px-4 py-3 flex items-center gap-2 select-none",
                                    onSort && "cursor-pointer hover:bg-secondary transition-colors active:bg-secondary/80"
                                )}
                            >
                                Price
                                {onSort && getSortIcon('price')}
                            </div>
                        </TableHead>

                        <TableHead className="p-0">
                            <div
                                onClick={() => onSort?.('change')}
                                className={cn(
                                    "px-4 py-3 flex items-center gap-2 select-none",
                                    onSort && "cursor-pointer hover:bg-secondary transition-colors active:bg-secondary/80"
                                )}
                            >
                                24h Change
                                {onSort && getSortIcon('change')}
                            </div>
                        </TableHead>

                        <TableHead className="p-0 hidden md:table-cell">
                            <div
                                onClick={() => onSort?.('marketCap')}
                                className={cn(
                                    "px-4 py-3 flex items-center justify-end gap-2 select-none",
                                    onSort && "cursor-pointer hover:bg-secondary transition-colors active:bg-secondary/80"
                                )}
                            >
                                Market Cap
                                {onSort && getSortIcon('marketCap')}
                            </div>
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
                                {isAuthenticated && (
                                    <TableCell className="pr-0">
                                        <Star
                                            className={cn(
                                                "w-5 h-5 md:w-6 md:h-6 cursor-pointer transition-all",
                                                watchlist.includes(coin.id)
                                                    ? "text-yellow-400 fill-yellow-400"
                                                    : "text-muted-foreground hover:text-yellow-400"
                                            )}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onToggleWatchlist(coin.id);
                                            }}
                                        />
                                    </TableCell>
                                )}

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

                                <TableCell className="font-medium">
                                    ${coin.current_price.toLocaleString()}
                                </TableCell>

                                <TableCell
                                    className={cn(
                                        "font-medium",
                                        coin.price_change_percentage_24h >= 0
                                            ? "text-green-500"
                                            : "text-red-500"
                                    )}
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
            <div className="sm:hidden space-y-3">
                {coins.length === 0 ? (
                    <div className="h-40 flex items-center justify-center border border-border rounded-xl">
                        {renderEmptyState ? renderEmptyState() : null}
                    </div>
                ) : (
                    coins.map((coin) => (
                        <div
                            key={coin.id}
                            onClick={() => navigate(`/coin/${coin.id}`)}
                            className="border border-border rounded-xl p-4 bg-card hover:bg-accent transition-colors active:bg-accent/70 cursor-pointer"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <img
                                        src={coin.image}
                                        alt={coin.name}
                                        className="w-10 h-10 rounded-full shrink-0"
                                    />
                                    <div className="leading-tight min-w-0">
                                        <p className="font-semibold text-sm truncate">
                                            {coin.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground uppercase">
                                            {coin.symbol}
                                        </p>
                                    </div>
                                </div>
                                {isAuthenticated && (
                                    <Star
                                        className={cn(
                                            "w-5 h-5 shrink-0 cursor-pointer transition-all",
                                            watchlist.includes(coin.id)
                                                ? "text-yellow-400 fill-yellow-400"
                                                : "text-muted-foreground"
                                        )}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onToggleWatchlist(coin.id);
                                        }}
                                    />
                                )}
                            </div>
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">
                                        Price
                                    </p>
                                    <p className="font-bold text-base">
                                        ${coin.current_price.toLocaleString()}
                                    </p>
                                </div>

                                <div className="text-right">
                                    <p className="text-xs text-muted-foreground mb-0.5">
                                        24h Change
                                    </p>
                                    <p
                                        className={cn(
                                            "font-bold text-base",
                                            coin.price_change_percentage_24h >= 0
                                                ? "text-green-500"
                                                : "text-red-500"
                                        )}
                                    >
                                        {coin.price_change_percentage_24h >= 0 ? "▲" : "▼"}
                                        {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}