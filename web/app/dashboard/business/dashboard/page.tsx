'use client';

import { useEffect } from 'react';
import { useSource } from '@/context/SourceContext';
import { useBusiness } from '@/context/BusinessContext';
import { Building2, TrendingUp, DollarSign, Activity, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BusinessDashboard() {
    const { setActiveSource } = useSource();
    const { businesses, metrics, loading } = useBusiness();

    useEffect(() => {
        setActiveSource('Business');
    }, [setActiveSource]);

    if (loading) {
        return <div className="p-8 text-white/50">Loading business data...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto p-8 w-full space-y-8">
            {/* Header */}
            <header>
                <h1 className="text-3xl font-light text-white tracking-tight">Business Dashboard</h1>
                <p className="text-sm text-white/40">Portfolio-wide operational intelligence</p>
            </header>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard
                    icon={<Building2 className="w-5 h-5" />}
                    label="Total Businesses"
                    value={metrics.activeBusiness.toString()}
                />
                <MetricCard
                    icon={<TrendingUp className="w-5 h-5" />}
                    label="Combined Revenue"
                    value={`₹${(metrics.totalRevenue / 10000000).toFixed(2)}Cr`}
                />
                <MetricCard
                    icon={<DollarSign className="w-5 h-5" />}
                    label="Combined Profit"
                    value={`₹${(metrics.totalProfit / 10000000).toFixed(2)}Cr`}
                    valueColor="text-green-400"
                />
                <MetricCard
                    icon={<Activity className="w-5 h-5" />}
                    label="Cash on Hand"
                    value={`₹${(metrics.cashOnHand / 10000000).toFixed(2)}Cr`}
                />
            </div>

            {/* Business Health Indicator */}
            <div className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-6">
                <h2 className="text-lg font-light text-white mb-4">Portfolio Health</h2>
                <div className="flex items-center gap-4">
                    <div className={`w-4 h-4 rounded-full ${metrics.healthStatus === 'Healthy' ? 'bg-green-400/50' :
                            metrics.healthStatus === 'Stable' ? 'bg-blue-400/50' :
                                'bg-red-400/50'
                        } shadow-lg ${metrics.healthStatus === 'Healthy' ? 'shadow-green-400/30' :
                            metrics.healthStatus === 'Stable' ? 'shadow-blue-400/30' :
                                'shadow-red-400/30'
                        }`} />
                    <span className="text-white/90 font-medium">{metrics.healthStatus}</span>
                    <span className="text-white/40 text-sm">
                        Overall profit margin: {((metrics.totalProfit / metrics.totalRevenue) * 100).toFixed(1)}%
                    </span>
                </div>
            </div>

            {/* Performance Graph Placeholder */}
            <div className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-light text-white">Performance Overview</h2>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 text-xs rounded-full bg-white/5 text-white/90 border border-white/10">
                            Revenue
                        </button>
                        <button className="px-4 py-2 text-xs rounded-full text-white/40 hover:text-white/90 hover:bg-white/5 transition-colors">
                            Profit
                        </button>
                        <button className="px-4 py-2 text-xs rounded-full text-white/40 hover:text-white/90 hover:bg-white/5 transition-colors">
                            Cash Flow
                        </button>
                    </div>
                </div>
                <div className="h-64 flex items-center justify-center text-white/40 text-sm">
                    Performance chart visualization coming soon...
                </div>
            </div>

            {/* Business Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {businesses.slice(0, 4).map((business) => (
                    <motion.div
                        key={business.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-6 hover:bg-white/[0.04] transition-colors group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                                    <Building2 className="w-6 h-6 text-white/80" />
                                </div>
                                <div>
                                    <h3 className="text-base font-medium text-white">{business.name}</h3>
                                    <p className="text-xs text-white/40">{business.industry}</p>
                                </div>
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors" />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <div className="text-xs text-white/40 mb-1">Revenue</div>
                                <div className="text-sm font-medium text-white">
                                    ₹{(business.monthlyRevenue / 100000).toFixed(1)}L
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-white/40 mb-1">Profit</div>
                                <div className="text-sm font-medium text-green-400">
                                    ₹{(business.monthlyProfit / 100000).toFixed(1)}L
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-white/40 mb-1">Status</div>
                                <div className="text-sm font-medium text-white/90">{business.status}</div>
                            </div>
                        </div>
                    </motion.div>
                ))}
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
