'use client';

import { useEffect, useState } from 'react';
import { useSource } from '@/context/SourceContext';
import { useBusiness } from '@/context/BusinessContext';
import { FileText, Download } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StatementsPage() {
    const { setActiveSource } = useSource();
    const { statements, documents, businesses, loading } = useBusiness();
    const [view, setView] = useState<'monthly' | 'quarterly'>('monthly');

    useEffect(() => {
        setActiveSource('Business');
    }, [setActiveSource]);

    if (loading) {
        return <div className="p-8 text-white/50">Loading statements...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto p-8 w-full space-y-8">
            {/* Header */}
            <header>
                <h1 className="text-3xl font-light text-white tracking-tight">Statements</h1>
                <p className="text-sm text-white/40">Financial clarity without complexity</p>
            </header>

            {/* View Toggle */}
            <div className="flex gap-2">
                <button
                    onClick={() => setView('monthly')}
                    className={`px-4 py-2 text-xs rounded-full border transition-colors ${view === 'monthly'
                            ? 'bg-white/5 text-white/90 border-white/10'
                            : 'text-white/40 border-white/5 hover:text-white/70 hover:bg-white/5'
                        }`}
                >
                    Monthly
                </button>
                <button
                    onClick={() => setView('quarterly')}
                    className={`px-4 py-2 text-xs rounded-full border transition-colors ${view === 'quarterly'
                            ? 'bg-white/5 text-white/90 border-white/10'
                            : 'text-white/40 border-white/5 hover:text-white/70 hover:bg-white/5'
                        }`}
                >
                    Quarterly
                </button>
            </div>

            {/* Profit & Loss */}
            <div className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-6">
                <h2 className="text-lg font-light text-white mb-6">Profit & Loss Statement</h2>
                <div className="space-y-4">
                    {statements.pl.map((pl, idx) => {
                        const business = businesses.find((b) => b.id === pl.businessId);
                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="rounded-2xl border border-white/5 bg-white/[0.02] p-6"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-white font-medium">{business?.name}</h3>
                                    <span className="text-white/40 text-sm">{pl.period}</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/60 text-sm">Revenue</span>
                                        <span className="text-white font-medium">
                                            ₹{(pl.revenue / 100000).toFixed(2)}L
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/60 text-sm">Expenses</span>
                                        <span className="text-red-400/80 font-medium">
                                            ₹{(pl.expenses / 100000).toFixed(2)}L
                                        </span>
                                    </div>
                                    <div className="h-px bg-white/5 my-2" />
                                    <div className="flex justify-between items-center">
                                        <span className="text-white font-medium">Net Profit</span>
                                        <span className="text-green-400 font-medium text-lg">
                                            ₹{(pl.netProfit / 100000).toFixed(2)}L
                                        </span>
                                    </div>

                                    {/* Expense Breakdown */}
                                    <details className="mt-4 pt-4 border-t border-white/5">
                                        <summary className="text-white/40 text-xs cursor-pointer hover:text-white/60 transition-colors">
                                            Expense Breakdown
                                        </summary>
                                        <div className="mt-3 space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-white/40">Salary</span>
                                                <span className="text-white/60">₹{(pl.expenseBreakdown.salary / 100000).toFixed(1)}L</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-white/40">Rent</span>
                                                <span className="text-white/60">₹{(pl.expenseBreakdown.rent / 100000).toFixed(1)}L</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-white/40">Marketing</span>
                                                <span className="text-white/60">₹{(pl.expenseBreakdown.marketing / 100000).toFixed(1)}L</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-white/40">Operations</span>
                                                <span className="text-white/60">₹{(pl.expenseBreakdown.operations / 100000).toFixed(1)}L</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-white/40">Other</span>
                                                <span className="text-white/60">₹{(pl.expenseBreakdown.other / 100000).toFixed(1)}L</span>
                                            </div>
                                        </div>
                                    </details>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Balance Sheet */}
            <div className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-6">
                <h2 className="text-lg font-light text-white mb-6">Balance Sheet (Simplified)</h2>
                <div className="space-y-4">
                    {statements.bs.map((bs, idx) => {
                        const business = businesses.find((b) => b.id === bs.businessId);
                        const totalAssets = Object.values(bs.assets).reduce((sum, val) => sum + val, 0);
                        const totalLiabilities = Object.values(bs.liabilities).reduce((sum, val) => sum + val, 0);

                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="rounded-2xl border border-white/5 bg-white/[0.02] p-6"
                            >
                                <h3 className="text-white font-medium mb-4">{business?.name}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <div className="text-sm text-white/40 mb-3">Assets</div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-white/60">Cash</span>
                                                <span className="text-white">₹{(bs.assets.cash / 100000).toFixed(1)}L</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-white/60">Inventory</span>
                                                <span className="text-white">₹{(bs.assets.inventory / 100000).toFixed(1)}L</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-white/60">Equipment</span>
                                                <span className="text-white">₹{(bs.assets.equipment / 100000).toFixed(1)}L</span>
                                            </div>
                                            <div className="h-px bg-white/5 my-2" />
                                            <div className="flex justify-between font-medium">
                                                <span className="text-white">Total</span>
                                                <span className="text-white">₹{(totalAssets / 100000).toFixed(1)}L</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-white/40 mb-3">Liabilities</div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-white/60">Loans</span>
                                                <span className="text-white">₹{(bs.liabilities.loans / 100000).toFixed(1)}L</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-white/60">Payables</span>
                                                <span className="text-white">₹{(bs.liabilities.payables / 100000).toFixed(1)}L</span>
                                            </div>
                                            <div className="h-px bg-white/5 my-2" />
                                            <div className="flex justify-between font-medium">
                                                <span className="text-white">Total</span>
                                                <span className="text-white">₹{(totalLiabilities / 100000).toFixed(1)}L</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-white/40 mb-3">Equity</div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between font-medium">
                                                <span className="text-white">Total Equity</span>
                                                <span className="text-green-400">₹{(bs.equity / 100000).toFixed(1)}L</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Documents */}
            <div className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-6">
                <h2 className="text-lg font-light text-white mb-6">Documents</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {documents.map((doc) => {
                        const business = businesses.find((b) => b.id === doc.businessId);
                        const typeColors = {
                            'Registration': 'bg-blue-500/10 text-blue-400',
                            'Tax Filing': 'bg-purple-500/10 text-purple-400',
                            'Contract': 'bg-green-500/10 text-green-400',
                            'Financial Statement': 'bg-orange-500/10 text-orange-400',
                        };

                        return (
                            <motion.div
                                key={doc.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-colors group cursor-pointer"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                                        <FileText className="w-5 h-5 text-white/60" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-white text-sm font-medium truncate">{doc.name}</h4>
                                        <p className="text-white/40 text-xs">{business?.name}</p>
                                        <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs ${typeColors[doc.type]}`}>
                                            {doc.type}
                                        </span>
                                    </div>
                                    <Download className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors flex-shrink-0" />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
