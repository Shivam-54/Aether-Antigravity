'use client';

import { useWealthAggregation } from '@/hooks/useWealthAggregation';
import { useSource } from '@/context/SourceContext';
import WealthSummaryCard from './WealthSummaryCard';
import AssetAllocationChart from './AssetAllocationChart';
import { TrendingUp, TrendingDown, DollarSign, Home, Building2, FileText, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';

export default function UnifiedWealthDashboard() {
    const wealth = useWealthAggregation();
    const { setActiveSource } = useSource();

    if (wealth.loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-white/50">Loading your wealth overview...</div>
            </div>
        );
    }

    const assetChartData = [
        {
            name: 'Shares',
            value: wealth.assetBreakdown.shares.value,
            percentage: wealth.assetBreakdown.shares.percentage,
            color: '#3b82f6' // blue-500
        },
        {
            name: 'Crypto',
            value: wealth.assetBreakdown.crypto.value,
            percentage: wealth.assetBreakdown.crypto.percentage,
            color: '#f59e0b' // amber-500
        },
        {
            name: 'Real Estate',
            value: wealth.assetBreakdown.realEstate.value,
            percentage: wealth.assetBreakdown.realEstate.percentage,
            color: '#10b981' // emerald-500
        },
        {
            name: 'Bonds',
            value: wealth.assetBreakdown.bonds.value,
            percentage: wealth.assetBreakdown.bonds.percentage,
            color: '#8b5cf6' // violet-500
        },
        {
            name: 'Business',
            value: wealth.assetBreakdown.business.value,
            percentage: wealth.assetBreakdown.business.percentage,
            color: '#ec4899' // pink-500
        }
    ];

    const isPositiveOverall = wealth.totalGainLoss >= 0;

    return (
        <div className="space-y-8">
            {/* Hero Section - Total Net Worth */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-8"
            >
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-sm font-light text-white/40 uppercase tracking-wider mb-2">
                            Total Net Worth
                        </h1>
                        <div className="text-5xl font-light text-white mb-4">
                            ₹{wealth.totalNetWorth.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`flex items-center gap-2 text-lg ${isPositiveOverall ? 'text-green-400' : 'text-red-400'}`}>
                                {isPositiveOverall ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                <span className="font-medium">
                                    {isPositiveOverall ? '+' : ''}₹{Math.abs(wealth.totalGainLoss).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                </span>
                            </div>
                            <div className={`text-sm ${isPositiveOverall ? 'text-green-400/60' : 'text-red-400/60'}`}>
                                ({isPositiveOverall ? '+' : ''}{wealth.totalGainLossPercent.toFixed(2)}%)
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex gap-8">
                        <div className="text-right">
                            <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Assets</div>
                            <div className="text-2xl font-light text-white">
                                {Object.values(wealth.assetBreakdown).reduce((sum, asset) => sum + asset.count, 0)}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Categories</div>
                            <div className="text-2xl font-light text-white">
                                {assetChartData.filter(a => a.value > 0).length}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Asset Allocation & Quick Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Asset Allocation Chart */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-1 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-6"
                >
                    <h2 className="text-lg font-light text-white mb-4">Asset Allocation</h2>
                    <AssetAllocationChart data={assetChartData} />
                </motion.div>

                {/* Performance Summary - Top Performers */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-6"
                >
                    <h2 className="text-lg font-light text-white mb-4">Performance Summary</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {/* Best Performer */}
                        <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                            <div className="text-xs text-green-400/60 uppercase tracking-wider mb-2">Best Performer</div>
                            <div className="text-2xl font-light text-white mb-1">
                                {wealth.assetBreakdown.crypto.gainLossPercent > wealth.assetBreakdown.shares.gainLossPercent ? 'Crypto' : 'Shares'}
                            </div>
                            <div className="text-sm text-green-400">
                                +{Math.max(wealth.assetBreakdown.crypto.gainLossPercent, wealth.assetBreakdown.shares.gainLossPercent).toFixed(2)}%
                            </div>
                        </div>

                        {/* Total Gain */}
                        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                            <div className="text-xs text-blue-400/60 uppercase tracking-wider mb-2">Total Returns</div>
                            <div className="text-2xl font-light text-white mb-1">
                                ₹{wealth.totalGainLoss.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                            </div>
                            <div className={`text-sm ${isPositiveOverall ? 'text-green-400' : 'text-red-400'}`}>
                                {isPositiveOverall ? '+' : ''}{wealth.totalGainLossPercent.toFixed(2)}%
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Asset Class Cards */}
            <div>
                <h2 className="text-lg font-light text-white mb-4">Asset Classes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    <WealthSummaryCard
                        title="Shares"
                        icon={<DollarSign size={24} className="text-blue-400" />}
                        value={wealth.assetBreakdown.shares.value}
                        gainLoss={wealth.assetBreakdown.shares.gainLoss}
                        gainLossPercent={wealth.assetBreakdown.shares.gainLossPercent}
                        count={wealth.assetBreakdown.shares.count}
                        color="blue"
                        onClick={() => setActiveSource('Shares')}
                    />

                    <WealthSummaryCard
                        title="Crypto"
                        icon={<svg className="w-6 h-6 text-amber-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 15.938c-.438.438-1.188.625-2.188.625-.438 0-.875-.063-1.313-.188v2.625h-1.5v-2.75c-.375-.063-.75-.125-1.125-.188v2.938h-1.5v-2.938l-2.625-.625v-1.5s1.125.063 1.063 0c.438 0 .625-.25.625-.563v-5.625c0-.188-.125-.438-.438-.438-.063 0-1.063 0-1.063 0l-.313-1.688L9.5 5.5V2.688h1.5v2.625c.375-.063.75-.125 1.125-.188V2.688h1.5v2.625c1 .125 1.75.313 2.188.75.375.375.562.875.562 1.5 0 .75-.25 1.313-.75 1.688.563.312.938.812.938 1.562 0 .688-.188 1.25-.688 1.75z" /></svg>}
                        value={wealth.assetBreakdown.crypto.value}
                        gainLoss={wealth.assetBreakdown.crypto.gainLoss}
                        gainLossPercent={wealth.assetBreakdown.crypto.gainLossPercent}
                        count={wealth.assetBreakdown.crypto.count}
                        color="amber"
                        onClick={() => setActiveSource('Crypto')}
                    />

                    <WealthSummaryCard
                        title="Real Estate"
                        icon={<Home size={24} className="text-emerald-400" />}
                        value={wealth.assetBreakdown.realEstate.value}
                        gainLoss={wealth.assetBreakdown.realEstate.gainLoss}
                        gainLossPercent={wealth.assetBreakdown.realEstate.gainLossPercent}
                        count={wealth.assetBreakdown.realEstate.count}
                        color="emerald"
                        onClick={() => setActiveSource('Real Estate')}
                    />

                    <WealthSummaryCard
                        title="Bonds"
                        icon={<FileText size={24} className="text-violet-400" />}
                        value={wealth.assetBreakdown.bonds.value}
                        gainLoss={wealth.assetBreakdown.bonds.gainLoss}
                        gainLossPercent={wealth.assetBreakdown.bonds.gainLossPercent}
                        count={wealth.assetBreakdown.bonds.count}
                        color="violet"
                        onClick={() => setActiveSource('Bonds')}
                    />

                    <WealthSummaryCard
                        title="Business"
                        icon={<Briefcase size={24} className="text-pink-400" />}
                        value={wealth.assetBreakdown.business.value}
                        gainLoss={wealth.assetBreakdown.business.gainLoss}
                        gainLossPercent={wealth.assetBreakdown.business.gainLossPercent}
                        count={wealth.assetBreakdown.business.count}
                        color="pink"
                        onClick={() => setActiveSource('Business')}
                    />
                </div>
            </div>

            {/* Empty State Hint */}
            {wealth.totalNetWorth === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-8 text-center"
                >
                    <div className="text-white/40 mb-4">
                        <Building2 size={48} className="mx-auto mb-3 text-white/20" />
                        <p className="text-lg">Your portfolio is empty</p>
                        <p className="text-sm mt-2">Start by adding assets to one of the categories above</p>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
