export interface AssetsTransactions {
    id: string
    userId: string;      
    coinId: string;   
    amount: number;
    price: number;
    type: "buy" | "sell";
    timestamp: Date;    
}
