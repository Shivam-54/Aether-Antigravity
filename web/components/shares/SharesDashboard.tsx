'use client';

import { useState } from 'react';
import { Line } from 'react-chartjs-2';
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
import { Share } from '@/types/shares';
import { TrendingUp, TrendingDown, Wallet, Package } from 'lucide-react';

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

import { useShares } from '@/context/SharesContext';

type TimeRange = '1M' | '3M' | '6M' | '1Y';

export default function SharesDashboard() {
    const { shares } = useShares();
    const [timeRange, setTimeRange] = useState<TimeRange>('1Y');

    // Calculate metrics
    const totalShareValue = shares.reduce((sum, s) => sum + s.totalValue, 0);
    const totalInvested = shares.reduce((sum, s) => sum + s.totalInvested, 0);
    const totalGainLoss = totalShareValue - totalInvested;
    const totalGainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;
    const avgReturn = shares.length > 0 ? shares.reduce((sum, s) => sum + s.gainLossPercent, 0) / shares.length : 0;
    const totalHoldings = shares.length;

    // Placeholder for real performance data - mostly empty/flat for now until history API is added
    const chartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: 'Portfolio Value',
                data: Array(12).fill(0), // Placeholder empty data
                borderColor: 'rgba(255, 255, 255, 0.8)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: 'rgba(255, 255, 255, 1)',
                pointHoverBorderColor: 'rgba(255, 255, 255, 0.2)',
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
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
                        return '₹' + (value / 100000).toFixed(0) + 'L';
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

    const metrics = [
        {
            icon: Wallet,
            label: 'Total Share Value',
            value: `₹${(totalShareValue / 100000).toFixed(2)}L`,
            subtext: 'Current market value',
            valueColor: 'text-white/90',
        },
        {
            icon: totalGainLoss >= 0 ? TrendingUp : TrendingDown,
            label: 'Total Gain / Loss',
            value: `${totalGainLoss >= 0 ? '+' : ''}₹${(Math.abs(totalGainLoss) / 100000).toFixed(2)}L`,
            subtext: `${totalGainLossPercent >= 0 ? '+' : ''}${totalGainLossPercent.toFixed(2)}% overall`,
            valueColor: totalGainLoss >= 0 ? 'text-green-400/80' : 'text-red-400/60',
        },
        {
            icon: TrendingUp,
            label: 'Average Return',
            value: `${avgReturn >= 0 ? '+' : ''}${avgReturn.toFixed(2)}%`,
            subtext: 'Weighted average',
            valueColor: avgReturn >= 0 ? 'text-green-400/80' : 'text-red-400/60',
        },
        {
            icon: Package,
            label: 'Total Holdings',
            value: totalHoldings.toString(),
            subtext: 'Distinct equity positions',
            valueColor: 'text-white/90',
        },
    ];

    const timeRanges: TimeRange[] = ['1M', '3M', '6M', '1Y'];

    return (
        <div className="space-y-8">

            {/* Portfolio Performance Graph */}
            <div
                className="relative p-8 rounded-3xl overflow-hidden"
                style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 0 50px 0 rgba(255, 255, 255, 0.05), inset 0 0 20px 0 rgba(255, 255, 255, 0.02)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                }}
            >
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-light tracking-wider text-white/90 mb-1">
                            Share Portfolio Performance
                        </h2>
                        <p className="text-sm font-light tracking-wide text-white/50">
                            Aggregate value movement across all equity holdings
                        </p>
                    </div>

                    {/* Time Range Toggle */}
                    <div className="flex gap-2">
                        {timeRanges.map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-4 py-2 rounded-lg text-xs font-light tracking-wider transition-all duration-200 ${timeRange === range
                                    ? 'bg-white/10 text-white/90 border border-white/20'
                                    : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/8 hover:text-white/70'
                                    }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="h-[300px]">
                    <Line data={chartData} options={chartOptions} />
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((metric, index) => (
                    <div
                        key={index}
                        className="relative p-6 rounded-2xl overflow-hidden group transition-all duration-300"
                        style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: '0 0 30px 0 rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                        }}
                    >
                        {/* Subtle Hover Texture */}
                        <div
                            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out z-0 mix-blend-overlay"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                                opacity: 0.06
                            }}
                        />

                        <div className="relative z-10 flex flex-col gap-3">
                            <metric.icon size={24} strokeWidth={1.5} className="text-white/60" />
                            <div>
                                <p className="text-xs font-light tracking-widest uppercase text-white/50 mb-1">
                                    {metric.label}
                                </p>
                                <h3 className={`text-2xl font-light mb-1 ${metric.valueColor}`}>
                                    {metric.value}
                                </h3>
                                <p className="text-xs font-light tracking-wide text-white/40">
                                    {metric.subtext}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
