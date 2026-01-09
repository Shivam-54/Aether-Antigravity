'use client';

import { Bond } from '@/types/bonds';

interface BondYieldAnalysisProps {
    bonds: Bond[];
}

export default function BondYieldAnalysis({ bonds }: BondYieldAnalysisProps) {
    // Calculate avg yield by type
    const yieldsByType = bonds.reduce((acc, bond) => {
        if (!acc[bond.type]) acc[bond.type] = { total: 0, count: 0 };
        acc[bond.type].total += bond.yieldToMaturity;
        acc[bond.type].count += 1;
        return acc;
    }, {} as Record<string, { total: number; count: number }>);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div>
                <h1 className="text-3xl font-light tracking-wide text-white/90 mb-2">Yield Analysis</h1>
                <p className="text-white/50 font-light tracking-wide">
                    Performance efficiency across bond categories
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(yieldsByType).map(([type, data]) => {
                    const avgYield = (data.total / data.count).toFixed(2);
                    return (
                        <div
                            key={type}
                            className="p-8 rounded-3xl group hover:bg-white/5 transition-all duration-300"
                            style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(10px)',
                            }}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-light text-white/90 tracking-wide">{type} Bonds</h3>
                                    <p className="text-sm text-white/40 mt-1">{data.count} Active Instruments</p>
                                </div>
                                <div className="text-3xl font-light text-white/90">
                                    {avgYield}%
                                </div>
                            </div>

                            {/* Visual Bar for Yield */}
                            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden mt-6">
                                <div
                                    className="h-full bg-amber-100/60 rounded-full"
                                    style={{ width: `${Number(avgYield) * 10}%` }} // Scale factor for visual
                                />
                            </div>
                            <p className="text-xs text-white/30 mt-2 text-right">Avg YTM</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
