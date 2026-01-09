'use client';

import { RealEstateTransaction } from '@/types/realestate';
import { ArrowDownCircle, ArrowUpCircle, Home, Calendar, CreditCard, TrendingUp, TrendingDown } from 'lucide-react';
import { useRealEstate } from '@/context/RealEstateContext';

export default function TransactionHistory() {
    const { transactions } = useRealEstate();

    // Sort by date descending
    const sortedTransactions = [...transactions].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'Buy':
                return ArrowDownCircle;
            case 'Sell':
                return ArrowUpCircle;
            case 'Rent':
                return Home;
            default:
                return Home;
        }
    };

    const getTransactionColor = (type: string) => {
        switch (type) {
            case 'Buy':
                return 'text-blue-400/80';
            case 'Sell':
                return 'text-green-400/80';
            case 'Rent':
                return 'text-purple-400/80';
            default:
                return 'text-white/60';
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-light tracking-wider text-white/90 mb-2">
                    Rental & Sale History
                </h2>
                <p className="text-sm font-light tracking-wide text-white/50">
                    Chronological transaction ledger
                </p>
            </div>

            <div
                className="relative overflow-hidden rounded-3xl"
                style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 0 50px 0 rgba(255, 255, 255, 0.05), inset 0 0 20px 0 rgba(255, 255, 255, 0.02)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                }}
            >
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left p-4 text-xs font-light tracking-widest uppercase text-white/40">
                                    Type
                                </th>
                                <th className="text-left p-4 text-xs font-light tracking-widest uppercase text-white/40">
                                    Property
                                </th>
                                <th className="text-left p-4 text-xs font-light tracking-widest uppercase text-white/40">
                                    Value
                                </th>
                                <th className="text-left p-4 text-xs font-light tracking-widest uppercase text-white/40">
                                    Payment
                                </th>
                                <th className="text-left p-4 text-xs font-light tracking-widest uppercase text-white/40">
                                    Date
                                </th>
                                <th className="text-left p-4 text-xs font-light tracking-widest uppercase text-white/40">
                                    Duration
                                </th>
                                <th className="text-right p-4 text-xs font-light tracking-widest uppercase text-white/40">
                                    Gain/Loss
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedTransactions.map((transaction, index) => {
                                const Icon = getTransactionIcon(transaction.type);
                                const colorClass = getTransactionColor(transaction.type);

                                return (
                                    <tr
                                        key={transaction.id}
                                        className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200"
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-1.5 rounded-full bg-white/5 ${colorClass}`}>
                                                    <Icon size={14} strokeWidth={1.5} />
                                                </div>
                                                <span className={`text-sm font-light ${colorClass}`}>
                                                    {transaction.type}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-sm font-light text-white/90">
                                                {transaction.propertyName}
                                            </p>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-sm font-light text-white/80">
                                                ₹{(transaction.value / 100000).toLocaleString('en-IN')} L
                                            </p>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-white/60 font-light tracking-wider">
                                                {transaction.paymentMethod}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-sm font-light text-white/70">
                                                {new Date(transaction.date).toLocaleDateString('en-GB', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-sm font-light text-white/60">
                                                {transaction.holdingDuration || '—'}
                                            </p>
                                        </td>
                                        <td className="p-4 text-right">
                                            {transaction.netGainLoss !== undefined ? (
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {transaction.netGainLoss >= 0 ? (
                                                        <TrendingUp size={14} strokeWidth={1.5} className="text-green-400/80" />
                                                    ) : (
                                                        <TrendingDown size={14} strokeWidth={1.5} className="text-red-400/80" />
                                                    )}
                                                    <span className={`text-sm font-light ${transaction.netGainLoss >= 0 ? 'text-green-400/80' : 'text-red-400/80'}`}>
                                                        {transaction.netGainLoss >= 0 ? '+' : ''}
                                                        ₹{(Math.abs(transaction.netGainLoss) / 100000).toFixed(1)}L
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-sm font-light text-white/30">—</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
