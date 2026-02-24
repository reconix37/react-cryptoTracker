import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useMemo } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { usePortfolioHistory } from "../hooks/usePortfolioHistory";

const CustomXAxisTick = ({ x, y, payload }: any) => {
    return (
        <g transform={`translate(${x},${y})`}>
            <text
                x={0}
                y={0}
                dy={16}
                textAnchor="middle"
                className="fill-muted-foreground text-xs"
            >
                {payload.value}
            </text>
        </g>
    );
};

const CustomYAxisTick = ({ x, y, payload }: any) => {
    const formatValue = (value: number) => {
        if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
        return `$${value}`;
    };

    return (
        <g transform={`translate(${x},${y})`}>
            <text
                x={0}
                y={0}
                dx={-10}
                textAnchor="end"
                className="fill-muted-foreground text-xs"
            >
                {formatValue(payload.value)}
            </text>
        </g>
    );
};

export default function PortfolioHistoryChart() {
    const [selectedPeriod, setSelectedPeriod] = useState<7 | 30 | 90>(7);
    const { history, isLoading, error } = usePortfolioHistory({ days: selectedPeriod });

    const chartData = useMemo(() => {
        return history.map(point => ({
            date: point.date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
            }),
            fullDate: point.date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            balance: point.balance,
        }));
    }, [history]);

    const trend = useMemo(() => {
        if (chartData.length < 2) return { direction: 'neutral' as const, change: 0, percentage: 0 };

        const first = chartData[0].balance;
        const last = chartData[chartData.length - 1].balance;
        const change = last - first;
        const percentage = first > 0 ? (change / first) * 100 : 0;

        return {
            direction: (change > 0 ? 'up' : change < 0 ? 'down' : 'neutral') as 'up' | 'down' | 'neutral',
            change,
            percentage,
        };
    }, [chartData]);

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64 mt-2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Portfolio History</CardTitle>
                    <CardDescription className="text-destructive">
                        Failed to load portfolio history
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (chartData.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Portfolio History</CardTitle>
                    <CardDescription>
                        Your portfolio history will appear here after your first daily snapshot
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                        No data available yet
                    </div>
                </CardContent>
            </Card>
        );
    }

    const TrendIcon = trend.direction === 'up' ? TrendingUp : trend.direction === 'down' ? TrendingDown : Minus;
    const trendColor = trend.direction === 'up' ? 'text-emerald-500' : trend.direction === 'down' ? 'text-rose-500' : 'text-muted-foreground';
    const gradientColor = trend.direction === 'up' ? '#10b981' : trend.direction === 'down' ? '#ef4444' : '#6366f1';

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle>Portfolio History</CardTitle>
                        <CardDescription>
                            Track your portfolio performance over time
                        </CardDescription>
                    </div>
                    <div className={`flex items-center gap-2 ${trendColor}`}>
                        <TrendIcon className="h-5 w-5" />
                        <div className="text-right">
                            <p className="text-sm font-medium">
                                {trend.change >= 0 ? '+' : ''}{trend.change.toLocaleString('en-US', { 
                                    style: 'currency', 
                                    currency: 'USD',
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2 
                                })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {trend.percentage >= 0 ? '+' : ''}{trend.percentage.toFixed(2)}%
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-4">
                    <Tabs value={selectedPeriod.toString()} onValueChange={(v) => setSelectedPeriod(Number(v) as 7 | 30 | 90)}>
                        <TabsList className="grid w-full max-w-[400px] grid-cols-3">
                            <TabsTrigger value="7">7 Days</TabsTrigger>
                            <TabsTrigger value="30">30 Days</TabsTrigger>
                            <TabsTrigger value="90">90 Days</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </CardHeader>
            
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={gradientColor} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={gradientColor} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        
                        <CartesianGrid 
                            strokeDasharray="3 3" 
                            stroke="currentColor"
                            className="stroke-muted-foreground/20"
                            vertical={false}
                        />
                        
                        <XAxis
                            dataKey="date"
                            tick={<CustomXAxisTick />}
                            tickLine={false}
                            axisLine={false}
                        />
                        
                        <YAxis
                            tick={<CustomYAxisTick />}
                            tickLine={false}
                            axisLine={false}
                        />
                        
                        <Tooltip
                            content={({ active, payload }) => {
                                if (!active || !payload || !payload[0]) return null;

                                const data = payload[0].payload;
                                
                                return (
                                    <div className="bg-background border border-border rounded-lg shadow-lg p-3">
                                        <p className="text-xs text-muted-foreground mb-1">
                                            {data.fullDate}
                                        </p>
                                        <p className="text-sm font-bold">
                                            {data.balance.toLocaleString('en-US', {
                                                style: 'currency',
                                                currency: 'USD',
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}
                                        </p>
                                    </div>
                                );
                            }}
                        />
                        
                        <Area
                            type="monotone"
                            dataKey="balance"
                            stroke={gradientColor}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorBalance)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}