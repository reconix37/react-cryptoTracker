export interface PortfolioAsset {
    id: string;
    amount: number;
    buyPrice: number;
}

export interface AssetsTransactions {
    id: string;      
    coinId: string;   
    amount: number;
    buyPrice: number;
    type: "buy" | "sell";
    date: number;    
}
