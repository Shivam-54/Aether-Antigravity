'use client';

import { Bond } from '@/types/bonds';
import { Clock, Calendar, ArrowRight } from 'lucide-react';

interface BondMaturityScheduleProps {
    bonds: Bond[];
}

export default function BondMaturitySchedule({ bonds }: BondMaturityScheduleProps) {
    // Sort by soonest to mature
    const sortedBonds = [...bonds].sort((a, b) => new Date(a.maturityDate).getTime() - new Date(b.maturityDate).getTime());

    // Helper to calculate time remaining
    const getTimeRemaining = (date: string) => {
        const diff = new Date(date).getTime() - new Date().getTime();
        const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
        const months = Math.floor((diff % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
        return `${years}y ${months}m`;
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div>
                <h1 className="text-3xl font-light tracking-wide text-white/90 mb-2">Maturity Schedule</h1>
                <p className="text-white/50 font-light tracking-wide">
                    Timeline of capital returns and corpus liquidity
                </p>
            </div>

            <div className="space-y-4">
                {sortedBonds.map((bond, index) => {
                    const isNext = index === 0;
                    return (
                        <div
                            key={bond.id}
                            className={`p-6 rounded-2xl transition-all duration-300 group ${isNext ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                            style={{
                                border: isNext ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.05)',
                                backdropFilter: 'blur(10px)',
                            }}
                        >
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                {/* Left: Bond Info */}
                                <div className="flex items-center gap-4 flex-1">
                                    <div className={`p-3 rounded-full ${isNext ? 'bg-amber-200/20 text-amber-200' : 'bg-white/5 text-white/40 group-hover:text-white/60'}`}>
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <h3 className={`text-lg font-light tracking-wide ${isNext ? 'text-white' : 'text-white/80'}`}>
                                            {bond.ticker}
                                        </h3>
                                        <p className="text-sm text-white/40 font-light">{bond.issuer}</p>
                                    </div>
                                </div>

                                {/* Center: Progress / Date */}
                                <div className="flex-1 w-full md:text-center">
                                    <div className="flex items-center gap-2 justify-center text-white/60 text-sm mb-1">
                                        <Calendar size={14} />
                                        <span>{new Date(bond.maturityDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                    </div>
                                    <div className={`text-xs font-light tracking-wider uppercase ${isNext ? 'text-amber-200/80' : 'text-white/30'}`}>
                                        {getTimeRemaining(bond.maturityDate)} remaining
                                    </div>
                                </div>

                                {/* Right: Value */}
                                <div className="text-right flex-1">
                                    <p className="text-xl font-light text-white/90">₹{(bond.faceValue / 100000).toFixed(2)} L</p>
                                    <p className="text-xs text-white/40">Principal Return</p>
                                </div>

                                {isNext && (
                                    <div className="hidden md:block">
                                        <ArrowRight size={20} className="text-amber-200/50" />
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
