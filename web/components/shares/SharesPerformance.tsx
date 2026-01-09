'use client';

import { Share, SectorExposure, BestWorstPerformer } from '@/types/shares';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { TrendingUp, TrendingDown, Award, AlertTriangle, Clock } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

interface SharesPerformanceProps {
    shares: Share[];
    sectorExposure: SectorExposure[];
}

export default function SharesPerformance({ shares, sectorExposure }: SharesPerformanceProps) {
    // Calculate gain/loss distribution
    const gainers = shares.filter(s => s.gainLossPercent > 0);
    const losers = shares.filter(s => s.gainLossPercent < 0);
    const totalGainValue = gainers.reduce((sum, s) => sum + s.gainLoss, 0);
    const totalLossValue = Math.abs(losers.reduce((sum, s) => sum + s.gainLoss, 0));

    // Find best and worst performers
    const bestPerformer: BestWorstPerformer = shares.reduce((best, current) =>
        current.gainLossPercent > best.gainLossPercent ? current : best
    );

    const worstPerformer: BestWorstPerformer = shares.reduce((worst, current) =>
        current.gainLossPercent < worst.gainLossPercent ? current : worst
    );

    // Holding duration analysis
    const shortTerm = shares.filter(s => s.holdingDuration === 'Short');
    const midTerm = shares.filter(s => s.holdingDuration === 'Mid');
    const longTerm = shares.filter(s => s.holdingDuration === 'Long');

    const avgReturnShort = shortTerm.length > 0
        ? shortTerm.reduce((sum, s) => sum + s.gainLossPercent, 0) / shortTerm.length
        : 0;
    const avgReturnMid = midTerm.length > 0
        ? midTerm.reduce((sum, s) => sum + s.gainLossPercent, 0) / midTerm.length
        : 0;
    const avgReturnLong = longTerm.length > 0
        ? longTerm.reduce((sum, s) => sum + s.gainLossPercent, 0) / longTerm.length
        : 0;

    // Sector exposure chart
    const sectorChartData = {
        labels: sectorExposure.map(s => s.sector),
        datasets: [{
            data: sectorExposure.map(s => s.percentage),
            backgroundColor: sectorExposure.map(s => s.color),
            borderColor: 'rgba(0, 0, 0, 0.8)',
            borderWidth: 2,
        }]
    };

    const sectorChartOptions = {
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
                callbacks: {
                    label: function (context: any) {
                        return `${context.label}: ${context.parsed.toFixed(2)}%`;
                    }
                }
            }
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-light tracking-wider text-white/90 mb-2">
                    Performance Report
                </h2>
                <p className="text-sm font-light tracking-wide text-white/50">
                    Analytical breakdown of portfolio performance
                </p>
            </div>

            {/* Gain vs Loss Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                    className="relative p-6 rounded-2xl overflow-hidden"
                    style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 0 30px 0 rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                    }}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <TrendingUp size={20} strokeWidth={1.5} className="text-green-400/80" />
                        <h3 className="text-lg font-light tracking-wide text-white/90">Total Gains</h3>
                    </div>
                    <p className="text-3xl font-light text-green-400/80 mb-2">
                        +₹{(totalGainValue / 100000).toFixed(2)}L
                    </p>
                    <p className="text-sm font-light text-white/50">
                        From {gainers.length} performing {gainers.length === 1 ? 'position' : 'positions'}
                    </p>
                </div>

                <div
                    className="relative p-6 rounded-2xl overflow-hidden"
                    style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 0 30px 0 rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                    }}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <TrendingDown size={20} strokeWidth={1.5} className="text-red-400/60" />
                        <h3 className="text-lg font-light tracking-wide text-white/90">Total Losses</h3>
                    </div>
                    <p className="text-3xl font-light text-red-400/60 mb-2">
                        -₹{(totalLossValue / 100000).toFixed(2)}L
                    </p>
                    <p className="text-sm font-light text-white/50">
                        From {losers.length} underperforming {losers.length === 1 ? 'position' : 'positions'}
                    </p>
                </div>
            </div>

            {/* Best & Worst Performers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                    className="relative p-6 rounded-2xl overflow-hidden"
                    style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 0 30px 0 rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                    }}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <Award size={20} strokeWidth={1.5} className="text-green-400/80" />
                        <h3 className="text-lg font-light tracking-wide text-white/90">Best Performer</h3>
                    </div>
                    <p className="text-xl font-light text-white/90 mb-1">{bestPerformer.symbol}</p>
                    <p className="text-sm font-light text-white/50 mb-3">{bestPerformer.companyName}</p>
                    <div className="flex items-center gap-2">
                        <p className="text-2xl font-light text-green-400/80">
                            +{bestPerformer.gainLossPercent.toFixed(2)}%
                        </p>
                        <p className="text-sm font-light text-white/40">
                            ₹{(bestPerformer.totalValue / 100000).toFixed(2)}L
                        </p>
                    </div>
                </div>

                <div
                    className="relative p-6 rounded-2xl overflow-hidden"
                    style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 0 30px 0 rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                    }}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <AlertTriangle size={20} strokeWidth={1.5} className="text-red-400/60" />
                        <h3 className="text-lg font-light tracking-wide text-white/90">Worst Performer</h3>
                    </div>
                    <p className="text-xl font-light text-white/90 mb-1">{worstPerformer.symbol}</p>
                    <p className="text-sm font-light text-white/50 mb-3">{worstPerformer.companyName}</p>
                    <div className="flex items-center gap-2">
                        <p className="text-2xl font-light text-red-400/60">
                            {worstPerformer.gainLossPercent.toFixed(2)}%
                        </p>
                        <p className="text-sm font-light text-white/40">
                            ₹{(worstPerformer.totalValue / 100000).toFixed(2)}L
                        </p>
                    </div>
                </div>
            </div>

            {/* Sector Exposure */}
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
                <h3 className="text-xl font-light tracking-wider text-white/90 mb-6">
                    Sector Exposure
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="h-[300px] flex items-center justify-center">
                        <Doughnut data={sectorChartData} options={sectorChartOptions} />
                    </div>
                    <div className="space-y-2">
                        {sectorExposure.map((sector, index) => (
                            <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: sector.color }}
                                    />
                                    <span className="text-sm font-light text-white/70">{sector.sector}</span>
                                </div>
                                <span className="text-sm font-light text-white/90">{sector.percentage.toFixed(2)}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Holding Duration Analysis */}
            <div
                className="relative p-6 rounded-2xl overflow-hidden"
                style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 0 30px 0 rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                }}
            >
                <div className="flex items-center gap-3 mb-6">
                    <Clock size={20} strokeWidth={1.5} className="text-white/60" />
                    <h3 className="text-lg font-light tracking-wide text-white/90">Holding Duration Analysis</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-white/5">
                        <p className="text-xs font-light tracking-widest uppercase text-white/50 mb-2">
                            Short-term (&lt; 1 year)
                        </p>
                        <p className="text-2xl font-light text-white/90 mb-1">
                            {shortTerm.length} {shortTerm.length === 1 ? 'position' : 'positions'}
                        </p>
                        <p className={`text-sm font-light ${avgReturnShort >= 0 ? 'text-green-400/80' : 'text-red-400/60'}`}>
                            {avgReturnShort >= 0 ? '+' : ''}{avgReturnShort.toFixed(2)}% avg return
                        </p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5">
                        <p className="text-xs font-light tracking-widest uppercase text-white/50 mb-2">
                            Mid-term (1-3 years)
                        </p>
                        <p className="text-2xl font-light text-white/90 mb-1">
                            {midTerm.length} {midTerm.length === 1 ? 'position' : 'positions'}
                        </p>
                        <p className={`text-sm font-light ${avgReturnMid >= 0 ? 'text-green-400/80' : 'text-red-400/60'}`}>
                            {avgReturnMid >= 0 ? '+' : ''}{avgReturnMid.toFixed(2)}% avg return
                        </p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5">
                        <p className="text-xs font-light tracking-widest uppercase text-white/50 mb-2">
                            Long-term (&gt; 3 years)
                        </p>
                        <p className="text-2xl font-light text-white/90 mb-1">
                            {longTerm.length} {longTerm.length === 1 ? 'position' : 'positions'}
                        </p>
                        <p className={`text-sm font-light ${avgReturnLong >= 0 ? 'text-green-400/80' : 'text-red-400/60'}`}>
                            {avgReturnLong >= 0 ? '+' : ''}{avgReturnLong.toFixed(2)}% avg return
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
