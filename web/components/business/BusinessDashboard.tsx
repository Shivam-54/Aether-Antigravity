'use client';

import { useBusiness } from '@/context/BusinessContext';
import { Building2, TrendingUp, DollarSign, Activity, Target } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BusinessDashboard() {
    const { businesses, transactions, metrics, loading } = useBusiness();

    if (loading) {
        return <div className="p-8 text-white/50">Loading business data...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto p-8 w-full space-y-8">
            {/* Header */}
            <header>
                <h1 className="text-3xl font-light text-white tracking-tight">Business Ventures</h1>
                <p className="text-sm text-white/40">Manage your business investments and track venture performance.</p>
            </header>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <MetricCard
                    icon={<DollarSign className="w-5 h-5" />}
                    label="Total Valuation"
                    value={`₹${(metrics.totalValuation / 10000000).toFixed(2)}Cr`}
                />
                <MetricCard
                    icon={<TrendingUp className="w-5 h-5" />}
                    label="Annual Revenue"
                    value={`₹${(metrics.totalRevenue / 10000000).toFixed(2)}Cr`}
                />
                <MetricCard
                    icon={<Activity className="w-5 h-5" />}
                    label="Annual Profit"
                    value={`₹${(metrics.totalProfit / 10000000).toFixed(2)}Cr`}
                    valueColor="text-green-400"
                />
                <MetricCard
                    icon={<Target className="w-5 h-5" />}
                    label="Avg Ownership"
                    value={`${metrics.avgOwnership.toFixed(1)}%`}
                />
                <MetricCard
                    icon={<Building2 className="w-5 h-5" />}
                    label="Active Ventures"
                    value={metrics.activeBusiness.toString()}
                />
            </div>

            {/* Business Holdings */}
            <div className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden">
                <div className="p-6 border-b border-white/5">
                    <h2 className="text-lg font-light text-white">Business Portfolio</h2>
                    <p className="text-sm text-white/40">Your business ventures and ownership stakes</p>
                </div>

                {businesses.length === 0 ? (
                    <div className="p-8 text-center text-white/50">No businesses found.</div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 p-6">
                        {businesses.map((business) => (
                            <BusinessCard key={business.id} business={business} />
                        ))}
                    </div>
                )}
            </div>

            {/* Cash Flow & Transactions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-6">
                    <h2 className="text-lg font-light text-white mb-4">Cash Flow Analysis</h2>
                    <div className="space-y-4">
                        {businesses.slice(0, 4).map((business) => {
                            const monthlyFlow = business.cashFlow;
                            return (
                                <div key={business.id} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                    <div>
                                        <div className="text-sm text-white font-medium">{business.name}</div>
                                        <div className="text-xs text-white/40">{business.ownership}% ownership</div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-sm font-medium ${monthlyFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {monthlyFlow >= 0 ? '+' : ''}₹{(Math.abs(monthlyFlow) / 100000).toFixed(2)}L
                                        </div>
                                        <div className="text-xs text-white/40">Monthly</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-6">
                    <h2 className="text-lg font-light text-white mb-4">Recent Transactions</h2>
                    <div className="space-y-4">
                        {transactions.slice(0, 4).map((tx) => {
                            const iconColors = {
                                'Investment': 'bg-blue-500/10 text-blue-400',
                                'Dividend': 'bg-green-500/10 text-green-400',
                                'Sale': 'bg-purple-500/10 text-purple-400',
                                'Acquisition': 'bg-orange-500/10 text-orange-400',
                                'Expense': 'bg-red-500/10 text-red-400'
                            };

                            return (
                                <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconColors[tx.type]}`}>
                                            <DollarSign size={18} />
                                        </div>
                                        <div>
                                            <div className="text-sm text-white font-medium">{tx.type}</div>
                                            <div className="text-xs text-white/40">{new Date(tx.date).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-sm font-medium ${tx.type === 'Expense' ? 'text-red-400' : 'text-green-400'}`}>
                                            {tx.type === 'Expense' ? '-' : '+'}₹{(tx.amount / 100000).toFixed(2)}L
                                        </div>
                                        <div className="text-xs text-white/40 truncate max-w-[120px]">{tx.description}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ icon, label, value, valueColor = 'text-white' }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    valueColor?: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-6"
        >
            <div className="flex items-center justify-between mb-3">
                <div className="text-white/40">{icon}</div>
            </div>
            <div className="space-y-1">
                <div className={`text-2xl font-light ${valueColor}`}>{value}</div>
                <div className="text-xs text-white/40 uppercase tracking-wider">{label}</div>
            </div>
        </motion.div>
    );
}

function BusinessCard({ business }: { business: any }) {
    const profitMargin = business.annualRevenue > 0 ? (business.annualProfit / business.annualRevenue) * 100 : 0;
    const statusColors = {
        'Active': 'bg-green-500/10 text-green-400 border-green-500/20',
        'Sold': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        'Acquired': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        'Inactive': 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-6 hover:bg-white/[0.04] transition-colors"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-white/80" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-white">{business.name}</h3>
                        <p className="text-sm text-white/40">{business.industry}</p>
                    </div>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusColors[business.status as keyof typeof statusColors]}`}>
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
                    <div className="text-xs text-white/40 mb-1">Revenue</div>
                    <div className="text-sm font-medium text-white">₹{(business.annualRevenue / 10000000).toFixed(2)}Cr</div>
                </div>
                <div>
                    <div className="text-xs text-white/40 mb-1">Profit</div>
                    <div className="text-sm font-medium text-green-400">₹{(business.annualProfit / 10000000).toFixed(2)}Cr</div>
                </div>
                <div>
                    <div className="text-xs text-white/40 mb-1">Margin</div>
                    <div className="text-sm font-medium text-white">{profitMargin.toFixed(1)}%</div>
                </div>
            </div>
        </motion.div>
    );
}
