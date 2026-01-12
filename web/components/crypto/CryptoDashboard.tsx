'use client';

import React from 'react';
import { useCrypto } from '@/context/CryptoContext';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, PieChart, Activity } from 'lucide-react';
import NetworkVisualization from '@/components/crypto/NetworkVisualization';

function MetricCard({ title, value, subtext, trend, icon: Icon }: any) {
    return (
        <div className="relative group overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.04] hover:border-white/10">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-xs font-medium text-white/50 tracking-wider uppercase">{title}</h3>
                    <div className="mt-2 text-2xl font-light text-white tracking-tight">{value}</div>
                    <div className="mt-1 flex items-center gap-2">
                        {trend && (
                            <span className={`text-xs ${trend > 0 ? 'text-green-400' : 'text-red-400'} flex items-center`}>
                                {trend > 0 ? '+' : ''}{trend}%
                            </span>
                        )}
                        {subtext && <span className="text-xs text-white/30">{subtext}</span>}
                    </div>
                </div>
                <div className="p-2 rounded-full bg-white/5 text-white/40 group-hover:text-white/80 transition-colors">
                    <Icon size={18} strokeWidth={1.5} />
                </div>
            </div>
        </div>
    );
}

export default function CryptoDashboard() {
    const { metrics, loading } = useCrypto();

    if (loading) {
        return <div className="p-10 text-white/50 animate-pulse">Initializing Aether Crypto...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto p-8 space-y-8 w-full">

            {/* Header */}
            <header className="flex flex-col gap-1">
                <h1 className="text-3xl font-light text-white tracking-tight">Crypto Overview</h1>
                <p className="text-sm text-white/40">Real-time market exposure and network activity.</p>
            </header>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Total Crypto Value"
                    value={`₹${(metrics.total_value / 100000).toFixed(2)}L`}
                    trend={metrics.change_24h_percent}
                    subtext="Last 24h"
                    icon={DollarSign}
                />
                <MetricCard
                    title="Portfolio Return"
                    value={`+${metrics.avg_portfolio_return}%`}
                    subtext="All-time weighted"
                    trend={1.2}
                    icon={TrendingUp}
                />
                <MetricCard
                    title="Active Assets"
                    value={metrics.total_assets_count}
                    subtext="Across 3 networks"
                    icon={PieChart}
                />
                <MetricCard
                    title="Network Status"
                    value="Online"
                    subtext="All nodes synced"
                    icon={Activity}
                />
            </div>

            {/* Main Content Split: Graph & Network Viz */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[450px]">

                {/* 1. Portfolio Performance Chart (Placeholder for now, using CSS graph or simple SVG) */}
                <div className="lg:col-span-2 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-6 relative flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-medium text-white/70">Portfolio Performance</h3>
                        <div className="flex gap-2">
                            {['1D', '1W', '1M', '1Y', 'ALL'].map(range => (
                                <button key={range} className="px-3 py-1 text-[10px] rounded-full bg-white/5 text-white/40 hover:bg-white/10 transition-colors">
                                    {range}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Simplified SVG Chart */}
                    <div className="flex-1 w-full relative">
                        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 50">
                            {/* Gradient Definition */}
                            <defs>
                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="rgba(255, 255, 255, 0.1)" />
                                    <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
                                </linearGradient>
                            </defs>

                            {/* Area */}
                            <path
                                d="M0,45 C20,40 30,20 50,25 C70,30 80,10 100,5 V50 H0 Z"
                                fill="url(#chartGradient)"
                            />
                            {/* Line */}
                            <path
                                d="M0,45 C20,40 30,20 50,25 C70,30 80,10 100,5"
                                fill="none"
                                stroke="rgba(255, 248, 220, 0.8)"
                                strokeWidth="0.5"
                            />
                        </svg>
                    </div>
                </div>

                {/* 2. Network Visualization */}
                <div className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-sm relative overflow-hidden flex flex-col">
                    <div className="absolute top-6 left-6 z-10">
                        <h3 className="text-sm font-medium text-white/70">Network Correlation</h3>
                    </div>
                    <div className="flex-1 w-full h-full">
                        <NetworkVisualization />
                    </div>
                </div>

            </div>
        </div>
    );
}
