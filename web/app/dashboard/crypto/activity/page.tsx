'use client';

import React from 'react';
import { useCrypto, CryptoTransaction } from '@/context/CryptoContext';
import { ArrowUpRight, ArrowDownRight, RefreshCcw, Zap } from 'lucide-react';

export default function ActivityPage() {
    const { transactions, loading } = useCrypto();

    if (loading) return <div className="p-10 text-white/50 animate-pulse">Loading chain activity...</div>;

    return (
        <div className="max-w-5xl mx-auto p-8 w-full space-y-8">
            <header>
                <h1 className="text-3xl font-light text-white tracking-tight">On-Chain Activity</h1>
                <p className="text-sm text-white/40">Real-time chronology of network interactions.</p>
            </header>

            <div className="space-y-4">
                {transactions.map((tx, index) => (
                    <ActivityItem key={tx.id} tx={tx} index={index} />
                ))}
            </div>
        </div>
    );
}

function ActivityItem({ tx, index }: { tx: CryptoTransaction, index: number }) {
    // Icon Logic
    let Icon = Zap;
    let iconColor = 'text-white/60';
    let label = 'Transaction';

    if (tx.type === 'Incoming') {
        Icon = ArrowDownRight;
        iconColor = 'text-green-400';
        label = 'Received';
    } else if (tx.type === 'Outgoing') {
        Icon = ArrowUpRight;
        iconColor = 'text-white/40';
        label = 'Sent';
    } else if (tx.type === 'Swap') {
        Icon = RefreshCcw;
        iconColor = 'text-blue-400';
        label = 'Swap';
    } else if (tx.type === 'Fee') {
        Icon = Zap;
        iconColor = 'text-orange-400';
        label = 'Gas Fee';
    }

    // Helper for relative time
    const timeAgo = (dateStr: string) => {
        const date = new Date(dateStr);
        const diff = Date.now() - date.getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    return (
        <div
            className="flex items-center justify-between p-5 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 group"
            style={{ animationDelay: `${index * 50}ms` }}
        >
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center ${iconColor}`}>
                    <Icon size={18} strokeWidth={1.5} />
                </div>
                <div>
                    <div className="text-sm font-medium text-white">{label} {tx.asset_symbol}</div>
                    <div className="text-xs text-white/40 flex items-center gap-2">
                        <span>{timeAgo(tx.timestamp)}</span>
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <span>{tx.network}</span>
                    </div>
                </div>
            </div>

            <div className="text-right">
                <div className="text-sm font-medium text-white">
                    {tx.type === 'Incoming' ? '+' : tx.type === 'Outgoing' ? '-' : ''}
                    {tx.amount} {tx.asset_symbol.split('->')[0].trim()}
                </div>
                <div className="text-xs text-white/40">
                    ₹{tx.amount_currency_value.toLocaleString()}
                </div>
            </div>
        </div>
    );
}
