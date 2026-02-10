export type Coin = {
    id: string;
    symbol: string;
    name: string;
    current_price: number;
    market_cap: number;
    image: string;
    price_change_percentage_24h: number;
}

export type CoinDetails = {
    id: string;
    symbol: string;
    name: string;
    price_change_percentage_24h: number;
        description: {
        en: string;
    };
    image: {
        large: string;
    };
    market_data: {
        current_price: {
            usd: number;
        };
        market_cap: {
            usd: number;
        };
        price_change_percentage_24h: number;
    };
}

export type SearchIndex = Pick<Coin, "id" | "name" | "symbol" | "image" | "current_price">