'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Enums
export type BusinessStatus = 'Growing' | 'Stable' | 'Declining' | 'Active' | 'Sold' | 'Acquired' | 'Inactive';
export type IndustryType = 'Software Development' | 'Renewable Energy' | 'Food & Beverage' | 'Cloud Services' | 'Tech' | 'Retail' | 'Manufacturing' | 'Services';
export type TransactionType = 'Income' | 'Expense' | 'Transfer' | 'Investment' | 'Dividend' | 'Sale' | 'Acquisition';
export type ExpenseCategory = 'Salary' | 'Rent' | 'Marketing' | 'Vendor' | 'Equipment' | 'Utilities' | 'Other';
export type HealthStatus = 'Healthy' | 'Stable' | 'At Risk';

// Business Types
export interface Business {
    id: string;
    name: string;
    industry: IndustryType;
    ownership: number; // Percentage
    valuation: number;
    annualRevenue: number;
    annualProfit: number;
    monthlyRevenue: number;
    monthlyProfit: number;
    founded: string;
    status: BusinessStatus;
    cashFlow: number;
    description?: string;
}

export interface BusinessTransaction {
    id: string;
    businessId: string;
    type: 'Investment' | 'Dividend' | 'Sale' | 'Acquisition' | 'Expense';
    amount: number;
    date: string;
    description: string;
}

// Cash Flow Entry
export interface CashFlowEntry {
    id: string;
    businessId: string;
    businessName: string;
    date: string;
    amount: number;
    type: TransactionType;
    category: ExpenseCategory | 'Revenue' | 'Investment';
    notes?: string;
}

// Financial Statements
export interface ProfitLossStatement {
    businessId: string;
    period: string; // 'Monthly' | 'Quarterly'
    revenue: number;
    expenses: number;
    netProfit: number;
    expenseBreakdown: {
        salary: number;
        rent: number;
        marketing: number;
        operations: number;
        other: number;
    };
}

export interface BalanceSheet {
    businessId: string;
    assets: {
        cash: number;
        inventory: number;
        equipment: number;
        other: number;
    };
    liabilities: {
        loans: number;
        payables: number;
        other: number;
    };
    equity: number;
}

export interface Document {
    id: string;
    businessId: string;
    name: string;
    type: 'Registration' | 'Tax Filing' | 'Contract' | 'Financial Statement';
    uploadDate: string;
    url?: string;
}

// AI Insights
export interface AIInsight {
    id: string;
    businessId?: string; // Optional - can be portfolio-wide
    type: 'Expense Spike' | 'Profit Trend' | 'Cash Flow Risk' | 'Growth Opportunity' | 'General';
    title: string;
    description: string;
    severity: 'info' | 'warning' | 'critical';
    date: string;
}

export interface BusinessMetrics {
    totalValuation: number;
    totalRevenue: number;
    totalProfit: number;
    avgOwnership: number;
    activeBusiness: number;
    cashOnHand: number;
    healthStatus: HealthStatus;
}

interface BusinessContextType {
    businesses: Business[];
    transactions: BusinessTransaction[];
    cashFlowEntries: CashFlowEntry[];
    statements: { pl: ProfitLossStatement[]; bs: BalanceSheet[] };
    documents: Document[];
    aiInsights: AIInsight[];
    metrics: BusinessMetrics;
    loading: boolean;
    addBusiness: (business: Business) => void;
    updateBusiness: (id: string, updates: Partial<Business>) => void;
    deleteBusiness: (id: string) => void;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

// Mock Data
const mockBusinesses: Business[] = [
    {
        id: 'biz-1',
        name: 'TechVenture Solutions',
        industry: 'Software Development',
        ownership: 45,
        valuation: 15000000,
        annualRevenue: 8500000,
        annualProfit: 2100000,
        monthlyRevenue: 708333,
        monthlyProfit: 175000,
        founded: '2019-03-15',
        status: 'Growing',
        cashFlow: 350000,
        description: 'Custom software development and consulting'
    },
    {
        id: 'biz-2',
        name: 'GreenEnergy Co.',
        industry: 'Renewable Energy',
        ownership: 30,
        valuation: 22000000,
        annualRevenue: 12000000,
        annualProfit: 3500000,
        monthlyRevenue: 1000000,
        monthlyProfit: 291667,
        founded: '2017-08-20',
        status: 'Stable',
        cashFlow: 520000,
        description: 'Solar and wind energy solutions'
    },
    {
        id: 'biz-3',
        name: 'UrbanCafe Chain',
        industry: 'Food & Beverage',
        ownership: 60,
        valuation: 5500000,
        annualRevenue: 3200000,
        annualProfit: 680000,
        monthlyRevenue: 266667,
        monthlyProfit: 56667,
        founded: '2020-01-10',
        status: 'Growing',
        cashFlow: 125000,
        description: 'Premium coffee and co-working space chain'
    },
    {
        id: 'biz-4',
        name: 'CloudHost Inc.',
        industry: 'Cloud Services',
        ownership: 25,
        valuation: 18000000,
        annualRevenue: 9500000,
        annualProfit: 2800000,
        monthlyRevenue: 791667,
        monthlyProfit: 233333,
        founded: '2018-05-12',
        status: 'Stable',
        cashFlow: 410000,
        description: 'Enterprise cloud hosting and infrastructure'
    }
];

const mockTransactions: BusinessTransaction[] = [
    {
        id: 'tx-1',
        businessId: 'biz-1',
        type: 'Dividend',
        amount: 125000,
        date: '2025-12-15',
        description: 'Q4 2025 Dividend Payment'
    },
    {
        id: 'tx-2',
        businessId: 'biz-2',
        type: 'Investment',
        amount: 500000,
        date: '2025-11-08',
        description: 'Series B Investment Round'
    },
    {
        id: 'tx-3',
        businessId: 'biz-3',
        type: 'Expense',
        amount: 85000,
        date: '2025-12-20',
        description: 'New Location Expansion'
    },
    {
        id: 'tx-4',
        businessId: 'biz-4',
        type: 'Dividend',
        amount: 95000,
        date: '2025-12-01',
        description: 'Q4 2025 Dividend Payment'
    }
];

const mockCashFlowEntries: CashFlowEntry[] = [
    { id: 'cf-1', businessId: 'biz-1', businessName: 'TechVenture Solutions', date: '2026-01-05', amount: 450000, type: 'Income', category: 'Revenue', notes: 'Client project payment' },
    { id: 'cf-2', businessId: 'biz-1', businessName: 'TechVenture Solutions', date: '2026-01-03', amount: -120000, type: 'Expense', category: 'Salary', notes: 'Monthly payroll' },
    { id: 'cf-3', businessId: 'biz-2', businessName: 'GreenEnergy Co.', date: '2026-01-02', amount: 850000, type: 'Income', category: 'Revenue', notes: 'Solar panel installation contract' },
    { id: 'cf-4', businessId: 'biz-3', businessName: 'UrbanCafe Chain', date: '2025-12-28', amount: -45000, type: 'Expense', category: 'Rent', notes: 'Q1 lease payment for 3 locations' },
    { id: 'cf-5', businessId: 'biz-4', businessName: 'CloudHost Inc.', date: '2025-12-20', amount: 620000, type: 'Income', category: 'Revenue', notes: 'Enterprise hosting contracts' },
    { id: 'cf-6', businessId: 'biz-3', businessName: 'UrbanCafe Chain', date: '2025-12-15', amount: -28000, type: 'Expense', category: 'Marketing', notes: 'Holiday promotion campaign' },
];

const mockStatements = {
    pl: [
        {
            businessId: 'biz-1',
            period: 'Monthly',
            revenue: 708333,
            expenses: 533333,
            netProfit: 175000,
            expenseBreakdown: { salary: 320000, rent: 85000, marketing: 45000, operations: 65000, other: 18333 }
        },
        {
            businessId: 'biz-2',
            period: 'Monthly',
            revenue: 1000000,
            expenses: 708333,
            netProfit: 291667,
            expenseBreakdown: { salary: 420000, rent: 105000, marketing: 62000, operations: 95000, other: 26333 }
        }
    ] as ProfitLossStatement[],
    bs: [
        {
            businessId: 'biz-1',
            assets: { cash: 2500000, inventory: 150000, equipment: 850000, other: 200000 },
            liabilities: { loans: 1200000, payables: 350000, other: 100000 },
            equity: 2050000
        }
    ] as BalanceSheet[]
};

const mockDocuments: Document[] = [
    { id: 'doc-1', businessId: 'biz-1', name: 'Business Registration Certificate', type: 'Registration', uploadDate: '2019-03-15' },
    { id: 'doc-2', businessId: 'biz-1', name: 'FY 2025 Tax Filing', type: 'Tax Filing', uploadDate: '2025-04-10' },
    { id: 'doc-3', businessId: 'biz-2', name: 'Investment Agreement - Series B', type: 'Contract', uploadDate: '2025-11-08' },
];

const mockAIInsights: AIInsight[] = [
    {
        id: 'ai-1',
        businessId: 'biz-3',
        type: 'Expense Spike',
        title: 'Marketing expenses increased by 35%',
        description: 'UrbanCafe Chain marketing spend rose significantly in December due to holiday campaigns. Monitor ROI to ensure sustainable growth.',
        severity: 'info',
        date: '2026-01-08'
    },
    {
        id: 'ai-2',
        businessId: 'biz-1',
        type: 'Profit Trend',
        title: 'Consistent profit margins over 6 months',
        description: 'TechVenture Solutions has maintained healthy profit margins above 24% for the past two quarters, indicating strong operational efficiency.',
        severity: 'info',
        date: '2026-01-07'
    },
    {
        id: 'ai-3',
        type: 'Growth Opportunity',
        title: 'Consider diversifying revenue streams',
        description: 'Portfolio analysis suggests exploring new industries. Current concentration in tech and energy sectors could benefit from retail or services balance.',
        severity: 'info',
        date: '2026-01-05'
    },
];

export function BusinessProvider({ children }: { children: ReactNode }) {
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [transactions, setTransactions] = useState<BusinessTransaction[]>([]);
    const [cashFlowEntries, setCashFlowEntries] = useState<CashFlowEntry[]>([]);
    const [statements, setStatements] = useState<{ pl: ProfitLossStatement[]; bs: BalanceSheet[] }>({ pl: [], bs: [] });
    const [documents, setDocuments] = useState<Document[]>([]);
    const [aiInsights, setAIInsights] = useState<AIInsight[]>([]);
    const [metrics, setMetrics] = useState<BusinessMetrics>({
        totalValuation: 0,
        totalRevenue: 0,
        totalProfit: 0,
        avgOwnership: 0,
        activeBusiness: 0,
        cashOnHand: 0,
        healthStatus: 'Stable'
    });
    const [loading, setLoading] = useState(true);

    // Load mock data on mount
    useEffect(() => {
        setLoading(true);

        // Simulate async data loading
        setTimeout(() => {
            setBusinesses(mockBusinesses);
            setTransactions(mockTransactions);
            setCashFlowEntries(mockCashFlowEntries);
            setStatements(mockStatements);
            setDocuments(mockDocuments);
            setAIInsights(mockAIInsights);

            // Calculate metrics
            const totalVal = mockBusinesses.reduce((sum, b) => sum + (b.valuation * b.ownership / 100), 0);
            const totalRev = mockBusinesses.reduce((sum, b) => sum + (b.annualRevenue * b.ownership / 100), 0);
            const totalProf = mockBusinesses.reduce((sum, b) => sum + (b.annualProfit * b.ownership / 100), 0);
            const avgOwn = mockBusinesses.reduce((sum, b) => sum + b.ownership, 0) / mockBusinesses.length;
            const activeCount = mockBusinesses.filter(b => b.status === 'Active' || b.status === 'Growing' || b.status === 'Stable').length;
            const totalCash = mockStatements.bs.reduce((sum, bs) => sum + bs.assets.cash, 0);

            // Simple health calculation
            const profitMargin = totalRev > 0 ? (totalProf / totalRev) : 0;
            const health: HealthStatus = profitMargin > 0.25 ? 'Healthy' : profitMargin > 0.15 ? 'Stable' : 'At Risk';

            setMetrics({
                totalValuation: totalVal,
                totalRevenue: totalRev,
                totalProfit: totalProf,
                avgOwnership: avgOwn,
                activeBusiness: activeCount,
                cashOnHand: totalCash,
                healthStatus: health
            });

            setLoading(false);
        }, 100);
    }, []);

    // CRUD Operations
    const addBusiness = (business: Business) => {
        setBusinesses(prev => [...prev, business]);
    };

    const updateBusiness = (id: string, updates: Partial<Business>) => {
        setBusinesses(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    };

    const deleteBusiness = (id: string) => {
        setBusinesses(prev => prev.filter(b => b.id !== id));
    };

    return (
        <BusinessContext.Provider value={{
            businesses,
            transactions,
            cashFlowEntries,
            statements,
            documents,
            aiInsights,
            metrics,
            loading,
            addBusiness,
            updateBusiness,
            deleteBusiness
        }}>
            {children}
        </BusinessContext.Provider>
    );
}

export function useBusiness() {
    const context = useContext(BusinessContext);
    if (context === undefined) {
        throw new Error('useBusiness must be used within a BusinessProvider');
    }
    return context;
}
