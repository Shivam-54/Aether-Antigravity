'use client';

import { useEffect, useState } from 'react';
import { useSource } from '@/context/SourceContext';
import { useBusiness } from '@/context/BusinessContext';
import { ArrowUpRight, ArrowDownRight, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CashFlowPage() {
    const { setActiveSource } = useSource();
    const { cashFlowEntries, businesses, loading } = useBusiness();
    const [filterBusiness, setFilterBusiness] = useState<string>('all');
    const [filterType, setFilterType] = useState<string>('all');

    useEffect(() => {
        setActiveSource('Business');
    }, [setActiveSource]);

    if (loading) {
        return <div className="p-8 text-white/50">Loading cash flow data...</div>;
    }

    const filteredEntries = cashFlowEntries.filter((entry) => {
        const businessMatch = filterBusiness === 'all' || entry.businessId === filterBusiness;
        const typeMatch = filterType === 'all' || entry.type === filterType;
        return businessMatch && typeMatch;
    });

    // Sort by date descending
    const sortedEntries = [...filteredEntries].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return (
        <div className="max-w-7xl mx-auto p-8 w-full space-y-8">
            {/* Header */}
            <header>
                <h1 className="text-3xl font-light text-white tracking-tight">Cash Flow</h1>
                <p className="text-sm text-white/40">Track money movement across your businesses</p>
            </header>

            {/* Filters */}
            <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2 text-white/40 text-sm">
                    <Filter className="w-4 h-4" />
                    <span>Filter:</span>
                </div>
                <select
                    value={filterBusiness}
                    onChange={(e) => setFilterBusiness(e.target.value)}
                    className="px-4 py-2 rounded-full bg-white/5 text-white/90 text-sm border border-white/10 outline-none hover:bg-white/10 transition-colors"
                >
                    <option value="all">All Businesses</option>
                    {businesses.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                </select>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2 rounded-full bg-white/5 text-white/90 text-sm border border-white/10 outline-none hover:bg-white/10 transition-colors"
                >
                    <option value="all">All Types</option>
                    <option value="Income">Income</option>
                    <option value="Expense">Expense</option>
                    <option value="Investment">Investment</option>
                    <option value="Transfer">Transfer</option>
                </select>
            </div>

            {/* Transaction List */}
            <div className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden">
                <div className="divide-y divide-white/5">
                    {sortedEntries.length === 0 ? (
                        <div className="p-8 text-center text-white/40">
                            No transactions found
                        </div>
                    ) : (
                        sortedEntries.map((entry) => (
                            <CashFlowRow key={entry.id} entry={entry} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

function CashFlowRow({ entry }: { entry: any }) {
    const isIncome = entry.amount > 0;
    const typeColors = {
        'Income': 'bg-green-500/10 text-green-400',
        'Expense': 'bg-red-500/10 text-red-400',
        'Investment': 'bg-blue-500/10 text-blue-400',
        'Transfer': 'bg-purple-500/10 text-purple-400',
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 hover:bg-white/[0.02] transition-colors"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${typeColors[entry.type as keyof typeof typeColors]}`}>
                        {isIncome ? (
                            <ArrowUpRight className="w-5 h-5" />
                        ) : (
                            <ArrowDownRight className="w-5 h-5" />
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <span className="text-white font-medium text-sm">{entry.businessName}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${typeColors[entry.type as keyof typeof typeColors]}`}>
                                {entry.category}
                            </span>
                        </div>
                        <div className="text-white/40 text-xs">
                            {new Date(entry.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            })}
                            {entry.notes && (
                                <span className="ml-2">· {entry.notes}</span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className={`text-lg font-medium ${isIncome ? 'text-green-400' : 'text-red-400'}`}>
                        {isIncome ? '+' : '-'}₹{(Math.abs(entry.amount) / 100000).toFixed(2)}L
                    </div>
                    <div className="text-xs text-white/40">{entry.type}</div>
                </div>
            </div>
        </motion.div>
    );
}
