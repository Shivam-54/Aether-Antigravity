import { Share, ShareTransaction, SharePerformance, SectorExposure, AIShareInsight } from '@/types/shares';

// Mock Share Holdings
export const mockShares: Share[] = [
    {
        id: '1',
        symbol: 'RELIANCE',
        companyName: 'Reliance Industries',
        sector: 'Energy',
        quantity: 150,
        avgBuyPrice: 2450.00,
        currentPrice: 2890.50,
        totalValue: 433575,
        totalInvested: 367500,
        gainLoss: 66075,
        gainLossPercent: 17.98,
        acquisitionDate: '2022-03-15',
        holdingDuration: 'Long'
    },
    {
        id: '2',
        symbol: 'TCS',
        companyName: 'Tata Consultancy Services',
        sector: 'Technology',
        quantity: 80,
        avgBuyPrice: 3350.00,
        currentPrice: 3825.75,
        totalValue: 306060,
        totalInvested: 268000,
        gainLoss: 38060,
        gainLossPercent: 14.20,
        acquisitionDate: '2021-11-20',
        holdingDuration: 'Long'
    },
    {
        id: '3',
        symbol: 'INFY',
        companyName: 'Infosys',
        sector: 'Technology',
        quantity: 200,
        avgBuyPrice: 1480.00,
        currentPrice: 1625.30,
        totalValue: 325060,
        totalInvested: 296000,
        gainLoss: 29060,
        gainLossPercent: 9.82,
        acquisitionDate: '2023-01-10',
        holdingDuration: 'Mid'
    },
    {
        id: '4',
        symbol: 'HDFCBANK',
        companyName: 'HDFC Bank',
        sector: 'Finance',
        quantity: 120,
        avgBuyPrice: 1620.00,
        currentPrice: 1755.80,
        totalValue: 210696,
        totalInvested: 194400,
        gainLoss: 16296,
        gainLossPercent: 8.38,
        acquisitionDate: '2022-08-05',
        holdingDuration: 'Mid'
    },
    {
        id: '5',
        symbol: 'ITC',
        companyName: 'ITC Limited',
        sector: 'FMCG',
        quantity: 500,
        avgBuyPrice: 385.00,
        currentPrice: 445.60,
        totalValue: 222800,
        totalInvested: 192500,
        gainLoss: 30300,
        gainLossPercent: 15.74,
        acquisitionDate: '2023-06-12',
        holdingDuration: 'Mid'
    },
    {
        id: '6',
        symbol: 'BHARTIARTL',
        companyName: 'Bharti Airtel',
        sector: 'Telecom',
        quantity: 180,
        avgBuyPrice: 825.00,
        currentPrice: 1125.40,
        totalValue: 202572,
        totalInvested: 148500,
        gainLoss: 54072,
        gainLossPercent: 36.41,
        acquisitionDate: '2021-09-18',
        holdingDuration: 'Long'
    },
    {
        id: '7',
        symbol: 'DRREDDYSLAB',
        companyName: 'Dr. Reddy\'s Laboratories',
        sector: 'Healthcare',
        quantity: 50,
        avgBuyPrice: 5180.00,
        currentPrice: 5425.75,
        totalValue: 271287.50,
        totalInvested: 259000,
        gainLoss: 12287.50,
        gainLossPercent: 4.74,
        acquisitionDate: '2023-11-22',
        holdingDuration: 'Short'
    },
    {
        id: '8',
        symbol: 'ASIANPAINT',
        companyName: 'Asian Paints',
        sector: 'Consumer Goods',
        quantity: 90,
        avgBuyPrice: 3150.00,
        currentPrice: 2985.20,
        totalValue: 268668,
        totalInvested: 283500,
        gainLoss: -14832,
        gainLossPercent: -5.23,
        acquisitionDate: '2024-02-14',
        holdingDuration: 'Short'
    },
    {
        id: '9',
        symbol: 'WIPRO',
        companyName: 'Wipro',
        sector: 'Technology',
        quantity: 250,
        avgBuyPrice: 420.00,
        currentPrice: 465.80,
        totalValue: 116450,
        totalInvested: 105000,
        gainLoss: 11450,
        gainLossPercent: 10.90,
        acquisitionDate: '2023-04-08',
        holdingDuration: 'Mid'
    },
    {
        id: '10',
        symbol: 'TATASTEEL',
        companyName: 'Tata Steel',
        sector: 'Metals',
        quantity: 300,
        avgBuyPrice: 125.00,
        currentPrice: 138.45,
        totalValue: 41535,
        totalInvested: 37500,
        gainLoss: 4035,
        gainLossPercent: 10.76,
        acquisitionDate: '2024-08-20',
        holdingDuration: 'Short'
    }
];

// Mock Transactions
export const mockShareTransactions: ShareTransaction[] = [
    {
        id: '1',
        shareId: '10',
        symbol: 'TATASTEEL',
        companyName: 'Tata Steel',
        type: 'Buy',
        quantity: 300,
        executionPrice: 125.00,
        totalValue: 37500,
        orderType: 'Market',
        status: 'Completed',
        date: '2024-08-20',
        time: '10:15 AM'
    },
    {
        id: '2',
        shareId: '8',
        symbol: 'ASIANPAINT',
        companyName: 'Asian Paints',
        type: 'Buy',
        quantity: 90,
        executionPrice: 3150.00,
        totalValue: 283500,
        orderType: 'Limit',
        status: 'Completed',
        date: '2024-02-14',
        time: '11:30 AM'
    },
    {
        id: '3',
        shareId: '7',
        symbol: 'DRREDDYSLAB',
        companyName: 'Dr. Reddy\'s Laboratories',
        type: 'Buy',
        quantity: 50,
        executionPrice: 5180.00,
        totalValue: 259000,
        orderType: 'Market',
        status: 'Completed',
        date: '2023-11-22',
        time: '02:45 PM'
    },
    {
        id: '4',
        shareId: '5',
        symbol: 'ITC',
        companyName: 'ITC Limited',
        type: 'Buy',
        quantity: 500,
        executionPrice: 385.00,
        totalValue: 192500,
        orderType: 'Market',
        status: 'Completed',
        date: '2023-06-12',
        time: '09:20 AM'
    },
    {
        id: '5',
        shareId: '9',
        symbol: 'WIPRO',
        companyName: 'Wipro',
        type: 'Buy',
        quantity: 250,
        executionPrice: 420.00,
        totalValue: 105000,
        orderType: 'Market',
        status: 'Completed',
        date: '2023-04-08',
        time: '01:10 PM'
    },
    {
        id: '6',
        shareId: '3',
        symbol: 'INFY',
        companyName: 'Infosys',
        type: 'Buy',
        quantity: 200,
        executionPrice: 1480.00,
        totalValue: 296000,
        orderType: 'Limit',
        status: 'Completed',
        date: '2023-01-10',
        time: '03:25 PM'
    },
    {
        id: '7',
        shareId: '4',
        symbol: 'HDFCBANK',
        companyName: 'HDFC Bank',
        type: 'Buy',
        quantity: 120,
        executionPrice: 1620.00,
        totalValue: 194400,
        orderType: 'Market',
        status: 'Completed',
        date: '2022-08-05',
        time: '10:50 AM'
    },
    {
        id: '8',
        shareId: '1',
        symbol: 'RELIANCE',
        companyName: 'Reliance Industries',
        type: 'Buy',
        quantity: 150,
        executionPrice: 2450.00,
        totalValue: 367500,
        orderType: 'Market',
        status: 'Completed',
        date: '2022-03-15',
        time: '11:05 AM'
    },
    {
        id: '9',
        shareId: '2',
        symbol: 'TCS',
        companyName: 'Tata Consultancy Services',
        type: 'Buy',
        quantity: 80,
        executionPrice: 3350.00,
        totalValue: 268000,
        orderType: 'Limit',
        status: 'Completed',
        date: '2021-11-20',
        time: '02:15 PM'
    },
    {
        id: '10',
        shareId: '6',
        symbol: 'BHARTIARTL',
        companyName: 'Bharti Airtel',
        type: 'Buy',
        quantity: 180,
        executionPrice: 825.00,
        totalValue: 148500,
        orderType: 'Market',
        status: 'Completed',
        date: '2021-09-18',
        time: '09:45 AM'
    }
];

// Mock Performance Data (12 months)
export const mockSharePerformance: SharePerformance[] = [
    { month: 'Jan 2024', value: 2180000 },
    { month: 'Feb 2024', value: 2245000 },
    { month: 'Mar 2024', value: 2298000 },
    { month: 'Apr 2024', value: 2365000 },
    { month: 'May 2024', value: 2425000 },
    { month: 'Jun 2024', value: 2390000 },
    { month: 'Jul 2024', value: 2455000 },
    { month: 'Aug 2024', value: 2518000 },
    { month: 'Sep 2024', value: 2475000 },
    { month: 'Oct 2024', value: 2545000 },
    { month: 'Nov 2024', value: 2608000 },
    { month: 'Dec 2024', value: 2598403.50 }
];

// Mock Sector Exposure
export const mockSectorExposure: SectorExposure[] = [
    { sector: 'Technology', value: 747570, percentage: 28.78, color: 'rgba(147, 197, 253, 0.8)' },
    { sector: 'Energy', value: 433575, percentage: 16.69, color: 'rgba(251, 191, 36, 0.8)' },
    { sector: 'Healthcare', value: 271287.50, percentage: 10.44, color: 'rgba(167, 243, 208, 0.8)' },
    { sector: 'Consumer Goods', value: 268668, percentage: 10.34, color: 'rgba(196, 181, 253, 0.8)' },
    { sector: 'FMCG', value: 222800, percentage: 8.58, color: 'rgba(252, 165, 165, 0.8)' },
    { sector: 'Finance', value: 210696, percentage: 8.11, color: 'rgba(134, 239, 172, 0.8)' },
    { sector: 'Telecom', value: 202572, percentage: 7.80, color: 'rgba(253, 224, 71, 0.8)' },
    { sector: 'Technology', value: 116450, percentage: 4.48, color: 'rgba(147, 197, 253, 0.8)' },
    { sector: 'Metals', value: 41535, percentage: 1.60, color: 'rgba(156, 163, 175, 0.8)' }
];

// Mock AI Insights
export const mockShareAIInsights: AIShareInsight[] = [
    {
        id: '1',
        message: 'Technology sector exposure at 33.26% exceeds recommended portfolio diversification threshold of 25%.',
        impact: 'Medium',
        confidence: 88,
        category: 'risk'
    },
    {
        id: '2',
        message: 'BHARTIARTL has outperformed your portfolio average by 24.3%, showing exceptional growth trajectory.',
        impact: 'High',
        confidence: 94,
        category: 'opportunity',
        shareId: '6'
    },
    {
        id: '3',
        message: 'ASIANPAINT currently in loss position (-5.23%). Market indicators suggest potential recovery in Q2 2025.',
        impact: 'Medium',
        confidence: 72,
        category: 'alert',
        shareId: '8'
    },
    {
        id: '4',
        message: 'Portfolio volatility decreased 12% over the last 30 days, indicating improved stability.',
        impact: 'Low',
        confidence: 85,
        category: 'opportunity'
    },
    {
        id: '5',
        message: 'Your long-term holdings (>3 years) show 18.2% better performance than short-term positions.',
        impact: 'Medium',
        confidence: 91,
        category: 'opportunity'
    },
    {
        id: '6',
        message: 'Consider rebalancing: Finance sector underweight at 8.11% vs market benchmark of 15%.',
        impact: 'Low',
        confidence: 79,
        category: 'risk'
    }
];
