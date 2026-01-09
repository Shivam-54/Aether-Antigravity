'use client';

import { useEffect, useState } from 'react';
import { useSource } from '@/context/SourceContext';
import { useBusiness } from '@/context/BusinessContext';
import { Building2, TrendingUp, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Business } from '@/context/BusinessContext';

export default function VenturesPage() {
    const { setActiveSource } = useSource();
    const { businesses, loading } = useBusiness();
    const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

    useEffect(() => {
        setActiveSource('Business');
    }, [setActiveSource]);

    if (loading) {
        return <div className="p-8 text-white/50">Loading ventures...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto p-8 w-full space-y-8">
            {/* Header */}
            <header>
                <h1 className="text-3xl font-light text-white tracking-tight">Ventures</h1>
                <p className="text-sm text-white/40">Your business portfolio and ownership stakes</p>
            </header>

            {/* Business Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {businesses.map((business) => (
                    <BusinessCard
                        key={business.id}
                        business={business}
                        onClick={() => setSelectedBusiness(business)}
                    />
                ))}
            </div>

            {/* Business Detail Modal */}
            <AnimatePresence>
                {selectedBusiness && (
                    <BusinessDetailModal
                        business={selectedBusiness}
                        onClose={() => setSelectedBusiness(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function BusinessCard({ business, onClick }: { business: Business; onClick: () => void }) {
    const profitMargin = business.annualRevenue > 0 ? (business.annualProfit / business.annualRevenue) * 100 : 0;
    const statusColors = {
        'Growing': 'bg-green-500/10 text-green-400 border-green-500/20',
        'Stable': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        'Declining': 'bg-red-500/10 text-red-400 border-red-500/20',
        'Active': 'bg-green-500/10 text-green-400 border-green-500/20',
        'Sold': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        'Acquired': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
        'Inactive': 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onClick}
            className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-6 hover:bg-white/[0.04] transition-colors cursor-pointer group"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/15 transition-colors">
                        <Building2 className="w-6 h-6 text-white/80" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-white">{business.name}</h3>
                        <p className="text-sm text-white/40">{business.industry}</p>
                    </div>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusColors[business.status]}`}>
                    {business.status}
                </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                    <div className="text-xs text-white/40 mb-1">Ownership</div>
                    <div className="text-sm font-medium text-white">{business.ownership}%</div>
                </div>
                <div>
                    <div className="text-xs text-white/40 mb-1">Valuation</div>
                    <div className="text-sm font-medium text-white">₹{(business.valuation / 10000000).toFixed(2)}Cr</div>
                </div>
                <div>
                    <div className="text-xs text-white/40 mb-1">Monthly Revenue</div>
                    <div className="text-sm font-medium text-white">₹{(business.monthlyRevenue / 100000).toFixed(1)}L</div>
                </div>
                <div>
                    <div className="text-xs text-white/40 mb-1">Monthly Profit</div>
                    <div className="text-sm font-medium text-green-400">₹{(business.monthlyProfit / 100000).toFixed(1)}L</div>
                </div>
                <div>
                    <div className="text-xs text-white/40 mb-1">Margin</div>
                    <div className="text-sm font-medium text-white">{profitMargin.toFixed(1)}%</div>
                </div>
            </div>
        </motion.div>
    );
}

function BusinessDetailModal({ business, onClose }: { business: Business; onClose: () => void }) {
    const profitMargin = business.annualRevenue > 0 ? (business.annualProfit / business.annualRevenue) * 100 : 0;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-8"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
                            <Building2 className="w-8 h-8 text-white/80" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-light text-white">{business.name}</h2>
                            <p className="text-sm text-white/40">{business.industry}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/5 transition-colors"
                    >
                        <X className="w-5 h-5 text-white/40 hover:text-white/70" />
                    </button>
                </div>

                {/* Overview */}
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-light text-white mb-3">Overview</h3>
                        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
                            <div className="flex justify-between">
                                <span className="text-white/40 text-sm">Founded</span>
                                <span className="text-white text-sm">{new Date(business.founded).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-white/40 text-sm">Ownership Structure</span>
                                <span className="text-white text-sm">{business.ownership}% stake</span>
                            </div>
                            {business.description && (
                                <div className="pt-2 border-t border-white/5">
                                    <p className="text-white/60 text-sm">{business.description}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Key Metrics */}
                    <div>
                        <h3 className="text-lg font-light text-white mb-3">Key Metrics</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                                <div className="text-xs text-white/40 mb-2">Annual Revenue</div>
                                <div className="text-2xl font-light text-white">
                                    ₹{(business.annualRevenue / 10000000).toFixed(2)}Cr
                                </div>
                            </div>
                            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                                <div className="text-xs text-white/40 mb-2">Annual Profit</div>
                                <div className="text-2xl font-light text-green-400">
                                    ₹{(business.annualProfit / 10000000).toFixed(2)}Cr
                                </div>
                            </div>
                            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                                <div className="text-xs text-white/40 mb-2">Profit Margin</div>
                                <div className="text-2xl font-light text-white">{profitMargin.toFixed(1)}%</div>
                            </div>
                            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                                <div className="text-xs text-white/40 mb-2">Monthly Cash Flow</div>
                                <div className="text-2xl font-light text-white">
                                    ₹{(business.cashFlow / 100000).toFixed(1)}L
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Valuation History Placeholder */}
                    <div>
                        <h3 className="text-lg font-light text-white mb-3">Valuation History</h3>
                        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 h-48 flex items-center justify-center">
                            <span className="text-white/40 text-sm">Valuation chart coming soon...</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
