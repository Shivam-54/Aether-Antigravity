'use client';

import { ShareTransaction } from '@/types/shares';
import { TrendingUp, TrendingDown, Clock, CheckCircle } from 'lucide-react';

import { useShares } from '@/context/SharesContext';

export default function SharesTransactions() {
    const { transactions } = useShares();
    // Sort transactions by date (newest first)
    const sortedTransactions = [...transactions].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-light tracking-wider text-white/90 mb-2">
                    Market Activity
                </h2>
                <p className="text-sm font-light tracking-wide text-white/50">
                    Transaction ledger for all share activity
                </p>
            </div>

            {/* Transactions Ledger */}
            {sortedTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm text-center">
                    <Clock className="w-10 h-10 text-white/20 mb-3" />
                    <h3 className="text-lg font-light text-white mb-2">No Transactions</h3>
                    <p className="text-white/40 max-w-sm">
                        Calculated transactions for your share purchases and sales will appear here.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {sortedTransactions.map((transaction) => (
                        <div
                            key={transaction.id}
                            className="relative p-6 rounded-2xl overflow-hidden group transition-all duration-300"
                            style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                boxShadow: '0 0 30px 0 rgba(255, 255, 255, 0.05)',
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)',
                            }}
                        >
                            {/* ... (rest of transaction item) ... */}
                            <div className="relative z-10">
                                {/* Header Row */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        {/* Transaction Type Icon */}
                                        <div
                                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${transaction.type === 'Buy'
                                                ? 'bg-green-500/10 border border-green-500/20'
                                                : 'bg-red-500/10 border border-red-500/20'
                                                }`}
                                        >
                                            {transaction.type === 'Buy' ? (
                                                <TrendingUp size={18} strokeWidth={1.5} className="text-green-400/80" />
                                            ) : (
                                                <TrendingDown size={18} strokeWidth={1.5} className="text-red-400/80" />
                                            )}
                                        </div>

                                        {/* Share Info */}
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="text-sm font-light text-white/90 tracking-wide">
                                                    {transaction.symbol}
                                                </p>
                                                <span
                                                    className={`px-2 py-0.5 rounded text-xs font-light tracking-wider ${transaction.type === 'Buy'
                                                        ? 'bg-green-500/10 text-green-400/80'
                                                        : 'bg-red-500/10 text-red-400/80'
                                                        }`}
                                                >
                                                    {transaction.type}
                                                </span>
                                            </div>
                                            <p className="text-xs font-light text-white/50 tracking-wide">
                                                {transaction.companyName}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="flex items-center gap-1.5">
                                        {transaction.status === 'Completed' ? (
                                            <CheckCircle size={14} strokeWidth={1.5} className="text-green-400/80" />
                                        ) : (
                                            <Clock size={14} strokeWidth={1.5} className="text-yellow-400/80" />
                                        )}
                                        <span className={`text-xs font-light tracking-wide ${transaction.status === 'Completed' ? 'text-green-400/80' : 'text-yellow-400/80'
                                            }`}>
                                            {transaction.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Transaction Details Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    <div>
                                        <p className="text-xs font-light tracking-widest uppercase text-white/40 mb-1">
                                            Quantity
                                        </p>
                                        <p className="text-sm font-light text-white/70">
                                            {transaction.quantity}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-light tracking-widest uppercase text-white/40 mb-1">
                                            Execution Price
                                        </p>
                                        <p className="text-sm font-light text-white/70">
                                            ₹{transaction.executionPrice.toLocaleString('en-IN')}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-light tracking-widest uppercase text-white/40 mb-1">
                                            Total Value
                                        </p>
                                        <p className="text-sm font-light text-white/90">
                                            ₹{(transaction.totalValue / 100000).toFixed(2)}L
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-light tracking-widest uppercase text-white/40 mb-1">
                                            Order Type
                                        </p>
                                        <p className="text-sm font-light text-white/70">
                                            {transaction.orderType}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-light tracking-widest uppercase text-white/40 mb-1">
                                            Date & Time
                                        </p>
                                        <p className="text-sm font-light text-white/70">
                                            {new Date(transaction.date).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </p>
                                        <p className="text-xs font-light text-white/50">
                                            {transaction.time}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
