'use client';

import { useState } from 'react';
import { useBonds } from '@/context/BondsContext';
import { Bond } from '@/types/bonds';
import { Plus } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import AddBondModal from '@/components/bonds/AddBondModal';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface BondFixedIncomeProps {
    bonds: Bond[];
}

export default function BondFixedIncome({ bonds }: BondFixedIncomeProps) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleBondAdded = () => {
        setRefreshKey(prev => prev + 1); // Trigger parent refresh
        setIsAddModalOpen(false);
    };
    // Data Processing: Income by Type
    const incomeByType = bonds.reduce((acc, bond) => {
        const annualIncome = bond.faceValue * (bond.couponRate / 100);
        acc[bond.type] = (acc[bond.type] || 0) + annualIncome;
        return acc;
    }, {} as Record<string, number>);

    const typeChartData = {
        labels: Object.keys(incomeByType),
        datasets: [
            {
                label: 'Annual Income',
                data: Object.values(incomeByType),
                backgroundColor: 'rgba(255, 230, 200, 0.2)',
                borderColor: 'rgba(255, 230, 200, 0.8)',
                borderWidth: 1,
                hoverBackgroundColor: 'rgba(255, 230, 200, 0.4)',
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                titleColor: 'rgba(255, 255, 255, 0.9)',
                bodyColor: 'rgba(255, 255, 255, 0.7)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                callbacks: {
                    label: (context: any) => '₹' + (context.parsed.y / 1000).toFixed(0) + 'k'
                }
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: 'rgba(255, 255, 255, 0.4)' },
            },
            y: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.4)',
                    callback: (value: any) => '₹' + (value / 1000).toFixed(0) + 'k'
                },
                border: { display: false },
            },
        },
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-light tracking-wide text-white/90 mb-2">Holdings</h1>
                    <p className="text-white/50 font-light tracking-wide">
                        Breakdown of recurring capital inflows
                    </p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/15 transition-colors flex items-center gap-2 text-sm"
                >
                    <Plus className="w-4 h-4" />
                    Add Bond
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Income by Type Chart */}
                <div
                    className="p-8 rounded-3xl"
                    style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                    }}
                >
                    <h3 className="text-lg font-light text-white/80 mb-6 tracking-wide">Income by Bond Type</h3>
                    <div className="h-[300px]">
                        <Bar data={typeChartData} options={chartOptions} />
                    </div>
                </div>

                {/* Top Payers List */}
                <div
                    className="p-8 rounded-3xl"
                    style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                    }}
                >
                    <h3 className="text-lg font-light text-white/80 mb-6 tracking-wide">Top Income Generators</h3>
                    <div className="space-y-4">
                        {[...bonds].sort((a, b) => (b.faceValue * b.couponRate) - (a.faceValue * a.couponRate)).slice(0, 5).map(bond => (
                            <div key={bond.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors">
                                <div>
                                    <p className="text-white/90 font-light">{bond.ticker}</p>
                                    <p className="text-xs text-white/40 uppercase tracking-wider">{bond.issuer}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-amber-200/90 font-light">₹{((bond.faceValue * (bond.couponRate / 100)) / 1000).toFixed(1)}k</p>
                                    <p className="text-xs text-white/40">Annual</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Add Bond Modal */}
            <AddBondModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleBondAdded}
            />
        </div>
    );
}
