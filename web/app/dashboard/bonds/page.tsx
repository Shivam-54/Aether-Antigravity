'use client';

import { useEffect, useState } from 'react';
import { useSource } from '@/context/SourceContext';
import { useBonds } from '@/context/BondsContext';
import { Calendar, TrendingUp, DollarSign, Activity, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import AddBondModal from '@/components/bonds/AddBondModal';

export default function BondsPage() {
    const { setActiveSource } = useSource();
    const { bonds, metrics, loading, addBond } = useBonds();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        setActiveSource('Bonds');
    }, [setActiveSource]);

    if (loading) {
        return <div className="p-8 text-white/50">Loading bonds data...</div>;
    }

    // Calculate total face value
    const totalFaceValue = bonds.reduce((sum, bond) => sum + bond.faceValue, 0);
    const totalCurrentValue = bonds.reduce((sum, bond) => sum + bond.currentPrice, 0);
    const avgYield = bonds.length > 0 ? bonds.reduce((sum, bond) => sum + bond.yieldToMaturity, 0) / bonds.length : 0;

    return (
        <div className="max-w-7xl mx-auto p-8 w-full space-y-8">
            {/* Header */}
            <header>
                <h1 className="text-3xl font-light text-white tracking-tight">Bonds Holdings</h1>
                <p className="text-sm text-white/40">Manage your bond portfolio and fixed income securities.</p>
            </header>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard
                    icon={<DollarSign className="w-5 h-5" />}
                    label="Current Value"
                    value={`₹${(totalCurrentValue / 100000).toFixed(2)}L`}
                />
                <MetricCard
                    icon={<TrendingUp className="w-5 h-5" />}
                    label="Face Value"
                    value={`₹${(totalFaceValue / 100000).toFixed(2)}L`}
                />
                <MetricCard
                    icon={<Activity className="w-5 h-5" />}
                    label="Avg Yield to Maturity"
                    value={`${avgYield.toFixed(2)}%`}
                />
                <MetricCard
                    icon={<Calendar className="w-5 h-5" />}
                    label="Active Bonds"
                    value={bonds.filter(b => b.status === 'Active').length.toString()}
                />
            </div>

            {/* Holdings Table */}
            <div className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-light text-white">Bond Holdings</h2>
                        <p className="text-sm text-white/40">Detailed breakdown of your bond portfolio</p>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/15 transition-colors flex items-center gap-2 text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Add Bond
                    </button>
                </div>

                {bonds.length === 0 ? (
                    <div className="p-8 text-center text-white/50">No bonds found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 text-xs font-medium text-white/40 uppercase tracking-wider">
                                    <th className="px-6 py-4">Bond</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Face Value</th>
                                    <th className="px-6 py-4">Coupon Rate</th>
                                    <th className="px-6 py-4">Yield to Maturity</th>
                                    <th className="px-6 py-4">Maturity Date</th>
                                    <th className="px-6 py-4">Current Value</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {bonds.map((bond) => (
                                    <BondRow key={bond.id} bond={bond} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Yield Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-6">
                    <h2 className="text-lg font-light text-white mb-4">Interest Income Calculator</h2>
                    <div className="space-y-4">
                        {bonds.slice(0, 3).map((bond) => {
                            const annualIncome = (bond.faceValue * bond.couponRate) / 100;
                            return (
                                <div key={bond.id} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                    <div>
                                        <div className="text-sm text-white font-medium">{bond.description}</div>
                                        <div className="text-xs text-white/40">{bond.couponRate}% coupon</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-green-400 font-medium">₹{annualIncome.toLocaleString()}</div>
                                        <div className="text-xs text-white/40">Annual</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-6">
                    <h2 className="text-lg font-light text-white mb-4">Maturity Schedule</h2>
                    <div className="space-y-4">
                        {bonds
                            .sort((a, b) => new Date(a.maturityDate).getTime() - new Date(b.maturityDate).getTime())
                            .slice(0, 3)
                            .map((bond) => {
                                const daysUntilMaturity = Math.floor((new Date(bond.maturityDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                                return (
                                    <div key={bond.id} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                        <div>
                                            <div className="text-sm text-white font-medium">{bond.ticker}</div>
                                            <div className="text-xs text-white/40">{new Date(bond.maturityDate).toLocaleDateString()}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-white/80 font-medium">{daysUntilMaturity} days</div>
                                            <div className="text-xs text-white/40">₹{bond.faceValue.toLocaleString()}</div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            </div>

            {/* Add Bond Modal */}
            <AddBondModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={addBond}
            />
        </div>
    );
}

function MetricCard({ icon, label, value }: {
    icon: React.ReactNode;
    label: string;
    value: string;
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
                <div className="text-2xl font-light text-white">{value}</div>
                <div className="text-xs text-white/40 uppercase tracking-wider">{label}</div>
            </div>
        </motion.div>
    );
}

function BondRow({ bond }: { bond: any }) {
    const statusColors = {
        'Active': 'bg-green-500/10 text-green-400 border-green-500/20',
        'Matured': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        'Sold': 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    };

    return (
        <motion.tr
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group hover:bg-white/[0.02] transition-colors"
        >
            <td className="px-6 py-4">
                <div>
                    <div className="text-sm font-medium text-white">{bond.description}</div>
                    <div className="text-xs text-white/40">{bond.ticker} · {bond.issuer}</div>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className="text-sm text-white/60">{bond.type}</span>
            </td>
            <td className="px-6 py-4">
                <span className="text-sm text-white/80">₹{bond.faceValue.toLocaleString()}</span>
            </td>
            <td className="px-6 py-4">
                <span className="text-sm text-white/80">{bond.couponRate}%</span>
            </td>
            <td className="px-6 py-4">
                <span className="text-sm text-green-400">{bond.yieldToMaturity}%</span>
            </td>
            <td className="px-6 py-4">
                <span className="text-sm text-white/80">{new Date(bond.maturityDate).toLocaleDateString()}</span>
            </td>
            <td className="px-6 py-4">
                <span className="text-sm font-medium text-white">₹{bond.currentPrice.toLocaleString()}</span>
            </td>
            <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusColors[bond.status as keyof typeof statusColors]}`}>
                    {bond.status}
                </span>
            </td>
        </motion.tr>
    );
}
