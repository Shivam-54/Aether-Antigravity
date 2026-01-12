'use client';

import { Bond, BondMetric } from '@/types/bonds';
import { TrendingUp, Calendar, Wallet, PieChart, Info } from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useMemo } from 'react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

import { useBonds } from '@/context/BondsContext';

export default function BondsDashboard() {
    const { bonds, metrics } = useBonds();

    // Calculations
    const totalValue = bonds.reduce((sum, b) => sum + (b.currentPrice || 0), 0);
    const annualIncome = bonds.reduce((sum, b) => sum + (b.faceValue * (b.couponRate / 100)), 0);
    const avgYield = bonds.length > 0
        ? bonds.reduce((sum, b) => sum + (b.yieldToMaturity || 0), 0) / bonds.length
        : 0;

    // Find next maturing bond
    const sortedByMaturity = [...bonds].sort((a, b) => new Date(a.maturityDate).getTime() - new Date(b.maturityDate).getTime());
    const nextMaturity = sortedByMaturity.find(b => new Date(b.maturityDate) > new Date());

    // Chart Data
    const chartData = {
        labels: metrics.map(m => m.month),
        datasets: [
            {
                label: 'Projected Monthly Income',
                data: metrics.map(m => m.income),
                borderColor: 'rgba(255, 230, 200, 0.8)', // Warm cream color
                backgroundColor: 'rgba(255, 230, 200, 0.05)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: 'rgba(255, 230, 200, 1)',
                pointHoverBorderColor: 'rgba(255, 230, 200, 0.2)',
                pointHoverBorderWidth: 8,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                titleColor: 'rgba(255, 255, 255, 0.9)',
                bodyColor: 'rgba(255, 255, 255, 0.7)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                padding: 12,
                displayColors: false,
                callbacks: {
                    label: function (context: any) {
                        return '₹' + context.parsed.y.toLocaleString('en-IN');
                    }
                }
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.4)',
                    font: {
                        size: 11,
                        weight: 'normal' as const,
                    },
                },
                border: {
                    display: false,
                },
            },
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                    drawBorder: false,
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.4)',
                    font: {
                        size: 11,
                        weight: 'normal' as const,
                    },
                    callback: function (value: any) {
                        return '₹' + (value / 1000).toFixed(0) + 'k';
                    }
                },
                border: {
                    display: false,
                },
            },
        },
        interaction: {
            intersect: false,
            mode: 'index' as const,
        },
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-light tracking-wide text-white/90 mb-2">Portfolio Overview</h1>
                <p className="text-white/50 font-light tracking-wide">
                    Capital stability and fixed income performance
                </p>
            </div>

            {/* Main Chart */}
            <div
                className="relative p-8 rounded-3xl overflow-hidden h-[400px]"
                style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 0 50px 0 rgba(255, 255, 255, 0.05), inset 0 0 20px 0 rgba(255, 255, 255, 0.02)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                }}
            >
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-light tracking-wider text-white/90 mb-1">
                            Fixed Income Trend
                        </h2>
                        <p className="text-sm font-light tracking-wide text-white/50">
                            Projected monthly coupon payments
                        </p>
                    </div>
                    <div className="p-2 rounded-full bg-white/5 border border-white/10">
                        <Info size={16} className="text-white/40" />
                    </div>
                </div>
                <div className="h-[300px] w-full">
                    <Line data={chartData} options={chartOptions} />
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    icon={Wallet}
                    label="Total Bond Value"
                    value={`₹${(totalValue / 10000000).toFixed(2)} Cr`}
                    subtext="Current Market Value"
                />
                <MetricCard
                    icon={Calendar}
                    label="Annual Fixed Income"
                    value={`₹${(annualIncome / 100000).toFixed(2)} L`}
                    subtext="Projected Interest"
                />
                <MetricCard
                    icon={TrendingUp}
                    label="Average Yield"
                    value={`${avgYield.toFixed(2)}%`}
                    subtext="Yield to Maturity"
                />
                <MetricCard
                    icon={PieChart}
                    label="Next Maturity"
                    value={nextMaturity ? new Date(nextMaturity.maturityDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : 'None'}
                    subtext={nextMaturity ? nextMaturity.ticker : '-'}
                />
            </div>
        </div>
    );
}

function MetricCard({ icon: Icon, label, value, subtext }: { icon: any; label: string; value: string; subtext: string }) {
    return (
        <div
            className="relative p-6 rounded-2xl overflow-hidden group hover:bg-white/5 transition-all duration-300"
            style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
            }}
        >
            <div className="relative z-10 flex flex-col gap-3">
                <Icon size={24} strokeWidth={1.5} className="text-white/40 group-hover:text-amber-200/80 transition-colors duration-300" />
                <div>
                    <p className="text-xs font-light tracking-widest uppercase text-white/40 mb-1">
                        {label}
                    </p>
                    <h3 className="text-2xl font-light text-white/90 mb-1 tracking-wide">
                        {value}
                    </h3>
                    <p className="text-xs font-light tracking-wide text-white/40">
                        {subtext}
                    </p>
                </div>
            </div>
        </div>
    );
}
