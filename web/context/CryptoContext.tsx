'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';

// --- Types ---

export interface CryptoAsset {
    id: string;
    symbol: string; // BTC, ETH
    name: string;   // Bitcoin, Ethereum
    quantity: number;
    current_price: number;
    purchase_price_avg: number;
    network: string; // 'Bitcoin', 'Ethereum', 'Solana'
    wallet_id?: string;
}

export interface CryptoTransaction {
    id: string;
    type: 'Incoming' | 'Outgoing' | 'Swap' | 'Fee';
    asset_symbol: string;
    amount: number;
    amount_currency_value: number; // Value in local currency at time of tx
    wallet_name: string;
    tx_hash: string;
    timestamp: string; // ISO date
    network: string;
    status: 'Completed' | 'Pending' | 'Failed';
}

export interface CryptoWallet {
    id: string;
    name: string; // "Ledger Nano X", "MetaMask Main"
    network: string; // "Multi-Chain", "Ethereum", "Solana"
    address: string;
    total_value: number;
    asset_count: number;
    last_active: string;
    is_connected: boolean;
}

export interface CryptoMetrics {
    total_value: number;
    change_24h_value: number;
    change_24h_percent: number;
    total_assets_count: number;
    avg_portfolio_return: number;
}

interface CryptoContextType {
    holdings: CryptoAsset[];
    transactions: CryptoTransaction[];
    wallets: CryptoWallet[];
    metrics: CryptoMetrics;
    loading: boolean;
    refreshData: () => Promise<void>;
}

// --- Mock Data ---

const mockHoldings: CryptoAsset[] = [
    {
        id: '1',
        symbol: 'BTC',
        name: 'Bitcoin',
        quantity: 0.45,
        current_price: 3850000, // INR roughly
        purchase_price_avg: 3200000,
        network: 'Bitcoin',
    },
    {
        id: '2',
        symbol: 'ETH',
        name: 'Ethereum',
        quantity: 4.2,
        current_price: 220000,
        purchase_price_avg: 180000,
        network: 'Ethereum',
    },
    {
        id: '3',
        symbol: 'SOL',
        name: 'Solana',
        quantity: 150,
        current_price: 8500,
        purchase_price_avg: 4500,
        network: 'Solana',
    },
    {
        id: '4',
        symbol: 'ADA',
        name: 'Cardano',
        quantity: 5000,
        current_price: 45,
        purchase_price_avg: 90, // Loss example
        network: 'Cardano',
    },
    {
        id: '5',
        symbol: 'DOT',
        name: 'Polkadot',
        quantity: 200,
        current_price: 600,
        purchase_price_avg: 550,
        network: 'Polkadot',
    }
];

const mockTransactions: CryptoTransaction[] = [
    {
        id: 't1',
        type: 'Incoming',
        asset_symbol: 'ETH',
        amount: 0.5,
        amount_currency_value: 110000,
        wallet_name: 'MetaMask Main',
        tx_hash: '0x71c...9a2',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        network: 'Ethereum',
        status: 'Completed'
    },
    {
        id: 't2',
        type: 'Swap',
        asset_symbol: 'USDC -> SOL',
        amount: 500,
        amount_currency_value: 42000,
        wallet_name: 'Phantom Wallet',
        tx_hash: '5x9...k2p',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        network: 'Solana',
        status: 'Completed'
    },
    {
        id: 't3',
        type: 'Outgoing',
        asset_symbol: 'BTC',
        amount: 0.01,
        amount_currency_value: 38500,
        wallet_name: 'Ledger Nano X',
        tx_hash: '1A1...z99',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
        network: 'Bitcoin',
        status: 'Completed'
    },
    {
        id: 't4',
        type: 'Fee',
        asset_symbol: 'ETH',
        amount: 0.002,
        amount_currency_value: 440,
        wallet_name: 'MetaMask Main',
        tx_hash: '0x33a...b12',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
        network: 'Ethereum',
        status: 'Completed'
    }
];

const mockWallets: CryptoWallet[] = [
    {
        id: 'w1',
        name: 'Ledger Nano X',
        network: 'Multi-Chain',
        address: 'bc1q...3x9z',
        total_value: 2500000,
        asset_count: 5,
        last_active: '2 hours ago',
        is_connected: true
    },
    {
        id: 'w2',
        name: 'MetaMask Main',
        network: 'Ethereum',
        address: '0x71c...9a2',
        total_value: 950000,
        asset_count: 12,
        last_active: 'Just now',
        is_connected: true
    },
    {
        id: 'w3',
        name: 'Phantom Wallet',
        network: 'Solana',
        address: 'Hv3...9pL',
        total_value: 1250000,
        asset_count: 8,
        last_active: '1 day ago',
        is_connected: false
    }
];

const mockMetrics: CryptoMetrics = {
    total_value: 4850000,   // ~48.5L
    change_24h_value: 125000,
    change_24h_percent: 2.85,
    total_assets_count: 25,
    avg_portfolio_return: 14.5
};

// --- Context ---

const CryptoContext = createContext<CryptoContextType | undefined>(undefined);

export function CryptoProvider({ children }: { children: ReactNode }) {
    const supabase = createClient();
    const [holdings, setHoldings] = useState<CryptoAsset[]>([]);
    const [transactions, setTransactions] = useState<CryptoTransaction[]>([]);
    const [wallets, setWallets] = useState<CryptoWallet[]>([]);
    const [metrics, setMetrics] = useState<CryptoMetrics>(mockMetrics);
    const [loading, setLoading] = useState(true);

    const refreshData = async () => {
        try {
            setLoading(true);

            // For now, we'll use mock data directly to avoid schema compatibility issues
            // In production, this would fetch from Supabase once the schema is properly set up
            setHoldings(mockHoldings);
            setTransactions(mockTransactions);
            setWallets(mockWallets);
            setMetrics(mockMetrics);

        } catch (error) {
            console.error('Error in CryptoProvider:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, []);

    return (
        <CryptoContext.Provider value={{ holdings, transactions, wallets, metrics, loading, refreshData }}>
            {children}
        </CryptoContext.Provider>
    );
}

export function useCrypto() {
    const context = useContext(CryptoContext);
    if (context === undefined) {
        throw new Error('useCrypto must be used within a CryptoProvider');
    }
    return context;
}
