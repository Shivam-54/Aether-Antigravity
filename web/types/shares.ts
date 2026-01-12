export type TransactionType = 'Buy' | 'Sell';
export type OrderType = 'Market' | 'Limit';
export type TransactionStatus = 'Completed' | 'Pending';
export type ImpactLevel = 'Low' | 'Medium' | 'High';
export type HoldingDuration = 'Short' | 'Mid' | 'Long'; // <1yr, 1-3yr, >3yr

export interface Share {
    id: string;
    symbol: string;
    companyName: string;
    sector: string;
    quantity: number;
    avgBuyPrice: number;
    currentPrice: number;
    totalValue: number;
    totalInvested: number;
    gainLoss: number;
    gainLossPercent: number;
    acquisitionDate: string;
    holdingDuration: HoldingDuration;
    status: 'active' | 'sold';
    saleDate?: string;
    salePrice?: number;
    saleTotalValue?: number;
    profitLoss?: number;
}

export interface ShareTransaction {
    id: string;
    shareId: string;
    symbol: string;
    companyName: string;
    type: TransactionType;
    quantity: number;
    executionPrice: number;
    totalValue: number;
    orderType: OrderType;
    status: TransactionStatus;
    date: string;
    time: string;
}

export interface SharePerformance {
    month: string;
    value: number;
}

export interface SectorExposure {
    sector: string;
    value: number;
    percentage: number;
    color: string;
}

export interface AIShareInsight {
    id: string;
    message: string;
    impact: ImpactLevel;
    confidence: number; // 0-100
    category: 'risk' | 'opportunity' | 'alert';
    shareId?: string;
}

export interface BestWorstPerformer {
    symbol: string;
    companyName: string;
    gainLossPercent: number;
    totalValue: number;
}
