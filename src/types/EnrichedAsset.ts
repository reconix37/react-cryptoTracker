export interface EnrichedAsset {
    id: string;
    amount: number;
    buyPrice: number;

    currentPrice: number;
    totalValue: number;

    invested: number;
    profitValue: number;
    profitPercent: number;

    priceChange: number;

    image: string | null;
    symbol: string | null;
    name: string | undefined;
}
