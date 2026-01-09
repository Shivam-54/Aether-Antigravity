'use client';

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
import { PortfolioPerformance, Property, PropertyStatus } from '@/types/realestate';
import { TrendingUp, Home, Wallet, PiggyBank } from 'lucide-react';
import { useRealEstate } from '@/context/RealEstateContext';

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

interface PortfolioOverviewProps {
    performanceData: PortfolioPerformance[];
    // properties: Property[]; // This line is commented out or removed based on the instruction's intent
}

export default function PortfolioOverview({ performanceData }: PortfolioOverviewProps) {
    const { properties, calculateRentalIncome } = useRealEstate();

    // Filter out sold properties for active portfolio metrics
    const activeProperties = properties.filter(p => p.status !== PropertyStatus.Sold);

    const totalProperties = activeProperties.length;
    const totalValuation = activeProperties.reduce((sum, p) => sum + p.currentValue, 0);
    const totalEquity = activeProperties.reduce((sum, p) => sum + p.equity, 0);
    const avgAppreciation = activeProperties.length > 0
        ? activeProperties.reduce((sum, p) => sum + p.appreciation, 0) / activeProperties.length
        : 0;
    const monthlyRentalIncome = calculateRentalIncome();

    const chartData = {
        labels: performanceData.map(d => d.month),
        datasets: [
            {
                label: 'Portfolio Value',
                data: performanceData.map(d => d.value),
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
                        return '₹' + (value / 10000000).toFixed(0) + 'Cr';
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
            icon: Home,
            label: 'Total Properties',
            value: totalProperties.toString(),
            subtext: 'Actively held assets',
        },
        {
            icon: TrendingUp,
            label: 'Total Valuation',
            value: `₹${(totalValuation / 10000000).toFixed(2)} Cr`,
            subtext: 'Current market value',
        },
        {
            icon: Wallet,
            label: 'Total Equity',
            value: `₹${(totalEquity / 10000000).toFixed(2)} Cr`,
            subtext: 'Owned capital',
        },
        {
            icon: PiggyBank,
            label: 'Appreciation',
            value: `${avgAppreciation.toFixed(1)}%`,
            subtext: 'Since acquisition',
        },
        {
            icon: Wallet,
            label: 'Monthly Rent',
            value: `₹${(monthlyRentalIncome / 100000).toFixed(2)} L`,
            subtext: 'Recurring income',
        },
    ];

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
                <div className="mb-6">
                    <h2 className="text-xl font-light tracking-wider text-white/90 mb-1">
                        Portfolio Value Trend
                    </h2>
                    <p className="text-sm font-light tracking-wide text-white/50">
                        Value movement across owned real estate assets over time
                    </p>
                </div>
                <div className="h-[300px]">
                    <Line data={chartData} options={chartOptions} />
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                                <h3 className="text-2xl font-light text-white/90 mb-1">
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
