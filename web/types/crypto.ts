export type CryptoChain = 'Bitcoin' | 'Ethereum' | 'Solana' | 'Cardano' | 'Polkadot' | 'Avalanche' | 'Polygon' | 'Binance Smart Chain';

export interface CryptoAsset {
    id: string;
    symbol: string;
    name: string;
    icon: string; // URL or Lucide icon name fallback
    color: string; // For chart accents
    currentPrice: number;
    priceChange24h: number; // Percentage
    priceHistory: number[]; // Simple array for sparklines
}

export interface CryptoHolding {
    id: string;
    assetId: string;
    asset: CryptoAsset; // Hydrated asset
    quantity: number;
    averageBuyPrice: number;
    totalValue: number;
    unrealizedPnL: number;
    unrealizedPnLPercent: number;
    allocationPercent: number;
}

export interface CryptoTransaction {
    id: string;
    hash: string;
    type: 'Buy' | 'Sell' | 'Swap' | 'Transfer' | 'Receive' | 'Gas';
    assetId: string;
    assetSymbol: string;
    amount: number;
    valueAtTime: number;
    fromAddress?: string;
    toAddress?: string;
    timestamp: string;
    status: 'Completed' | 'Pending' | 'Failed';
    network: CryptoChain;
    fee?: number;
}

export interface Wallet {
    id: string;
    name: string;
    network: CryptoChain;
    address: string;
    balance: number; // Converted to base currency (INR/USD)
    assetCount: number;
    lastActivity: string;
    isConnected: boolean;
    provider: 'MetaMask' | 'Phantom' | 'Ledger' | 'Trust Wallet' | 'Other';
}

export interface CryptoMetric {
    label: string;
    value: string | number;
    change?: number;
    trend: 'up' | 'down' | 'neutral';
    icon?: any;
}
