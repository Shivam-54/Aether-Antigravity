export type AssetType = 'REAL_ESTATE' | 'CRYPTO' | 'SHARE' | 'BOND' | 'BUSINESS';

export interface Asset {
    id: string;
    user_id: string;
    type: AssetType;
    name: string;
    value: number;
    cost_basis?: number;
    quantity?: number;
    meta?: Record<string, any>; // Flexible for address, ticker, etc.
    created_at: string;
    updated_at: string;
}

export interface Expense {
    id: string;
    user_id: string;
    category: string;
    description?: string;
    amount: number;
    date: string;
    is_recurring: boolean;
    created_at: string;
}

export interface Income {
    id: string;
    user_id: string;
    source: string;
    amount: number;
    date: string;
    asset_id?: string;
    created_at: string;
}

export interface DashboardStats {
    totalNetWorth: number;
    totalMonthlyIncome: number;
    totalMonthlyExpenses: number;
    profitLoss: number;
}
