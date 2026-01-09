'use client';

import { useEffect, useState } from 'react';
import { useSource } from '@/context/SourceContext';
import { useShares } from '@/context/SharesContext';
import { TrendingUp, TrendingDown, Activity, DollarSign, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import AddShareModal from '@/components/shares/AddShareModal';

export default function SharesPage() {
    const { setActiveSource } = useSource();
    const { shares, transactions, loading, addShare } = useShares();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        setActiveSource('Shares');
    }, [setActiveSource]);

    if (loading) {
        return <div className="p-8 text-white/50">Loading shares data...</div>;
    }

    // Calculate metrics from shares data
    const totalInvested = shares.reduce((sum, share) => sum + share.totalInvested, 0);
    const totalValue = shares.reduce((sum, share) => sum + share.totalValue, 0);
    const totalGainLoss = totalValue - totalInvested;
    const totalGainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

    return (
        <div className="max-w-7xl mx-auto p-8 w-full space-y-8">
            {/* Header */}
            <header>
                <h1 className="text-3xl font-light text-white tracking-tight">Shares & Stocks</h1>
                <p className="text-sm text-white/40">Monitor your public equity investments and stock portfolio.</p>
            </header>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard
                    icon={<DollarSign className="w-5 h-5" />}
                    label="Total Value"
                    value={`₹${(totalValue / 100000).toFixed(2)}L`}
                    change={totalGainLossPercent}
                />
                <MetricCard
                    icon={<TrendingUp className="w-5 h-5" />}
                    label="Total Invested"
                    value={`₹${(totalInvested / 100000).toFixed(2)}L`}
                />
                <MetricCard
                    icon={totalGainLoss >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    label="Gain/Loss"
                    value={`₹${Math.abs(totalGainLoss / 100000).toFixed(2)}L`}
                    change={totalGainLossPercent}
                    valueColor={totalGainLoss >= 0 ? 'text-green-400' : 'text-red-400'}
                />
                <MetricCard
                    icon={<Activity className="w-5 h-5" />}
                    label="Holdings"
                    value={shares.length.toString()}
                />
            </div>

            {/* Holdings Table */}
            <div className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-light text-white">Portfolio Holdings</h2>
                        <p className="text-sm text-white/40">Detailed breakdown of your stock holdings</p>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/15 transition-colors flex items-center gap-2 text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Add Share
                    </button>
                </div>

                {shares.length === 0 ? (
                    <div className="p-8 text-center text-white/50">No shares found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 text-xs font-medium text-white/40 uppercase tracking-wider">
                                    <th className="px-6 py-4">Company</th>
                                    <th className="px-6 py-4">Sector</th>
                                    <th className="px-6 py-4">Quantity</th>
                                    <th className="px-6 py-4">Avg Buy Price</th>
                                    <th className="px-6 py-4">Current Price</th>
                                    <th className="px-6 py-4">Total Value</th>
                                    <th className="px-6 py-4">Gain/Loss</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {shares.map((share) => (
                                    <ShareRow key={share.id} share={share} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Recent Transactions */}
            <div className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden">
                <div className="p-6 border-b border-white/5">
                    <h2 className="text-lg font-light text-white">Market Activity</h2>
                    <p className="text-sm text-white/40">Recent share transactions</p>
                </div>
                <div className="p-6 space-y-3">
                    {transactions.slice(0, 5).map((tx) => {
                        const share = shares.find(s => s.id === tx.shareId);
                        return (
                            <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'Buy' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                        }`}>
                                        {tx.type === 'Buy' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                    </div>
                                    <div>
                                        <div className="text-sm text-white font-medium">{tx.type} {share?.companyName || 'Unknown'}</div>
                                        <div className="text-xs text-white/40">{new Date(tx.date).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-white font-medium">{tx.quantity} shares</div>
                                    <div className="text-xs text-white/40">@₹{tx.executionPrice.toLocaleString()}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Add Share Modal */}
            <AddShareModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={addShare}
            />
        </div>
    );
}

function MetricCard({ icon, label, value, change, valueColor = 'text-white' }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    change?: number;
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
                {change !== undefined && (
                    <div className={`text-xs font-medium ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                    </div>
                )}
            </div>
            <div className="space-y-1">
                <div className={`text-2xl font-light ${valueColor}`}>{value}</div>
                <div className="text-xs text-white/40 uppercase tracking-wider">{label}</div>
            </div>
        </motion.div>
    );
}

function ShareRow({ share }: { share: any }) {
    const isPositive = share.gainLoss >= 0;

    return (
        <motion.tr
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group hover:bg-white/[0.02] transition-colors"
        >
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/80">
                        {share.symbol.substring(0, 2)}
                    </div>
                    <div>
                        <div className="text-sm font-medium text-white">{share.companyName}</div>
                        <div className="text-xs text-white/40">{share.symbol}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className="text-sm text-white/60">{share.sector}</span>
            </td>
            <td className="px-6 py-4">
                <span className="text-sm text-white/80">{share.quantity}</span>
            </td>
            <td className="px-6 py-4">
                <span className="text-sm text-white/80">₹{share.avgBuyPrice.toLocaleString()}</span>
            </td>
            <td className="px-6 py-4">
                <span className="text-sm text-white/80">₹{share.currentPrice.toLocaleString()}</span>
            </td>
            <td className="px-6 py-4">
                <span className="text-sm font-medium text-white">₹{share.totalValue.toLocaleString()}</span>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    {isPositive ? <TrendingUp size={14} className="text-green-400" /> : <TrendingDown size={14} className="text-red-400" />}
                    <div>
                        <div className={`text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            {isPositive ? '+' : ''}₹{Math.abs(share.gainLoss).toLocaleString()}
                        </div>
                        <div className={`text-xs ${isPositive ? 'text-green-400/60' : 'text-red-400/60'}`}>
                            {isPositive ? '+' : ''}{share.gainLossPercent.toFixed(2)}%
                        </div>
                    </div>
                </div>
            </td>
        </motion.tr>
    );
}
