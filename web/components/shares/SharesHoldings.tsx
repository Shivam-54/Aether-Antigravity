'use client';

import { Share } from '@/types/shares';
import { TrendingUp, TrendingDown, Edit2, Trash2 } from 'lucide-react';

interface SharesHoldingsProps {
    shares: Share[];
}

export default function SharesHoldings({ shares }: SharesHoldingsProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-light tracking-wider text-white/90 mb-2">
                    Holdings
                </h2>
                <p className="text-sm font-light tracking-wide text-white/50">
                    Your equity portfolio inventory
                </p>
            </div>

            {/* Holdings Table */}
            <div className="space-y-3">
                {shares.map((share) => (
                    <div
                        key={share.id}
                        className="relative p-6 rounded-2xl overflow-hidden group transition-all duration-300 hover:scale-[1.01]"
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

                        <div className="relative z-10 grid grid-cols-12 gap-4 items-center">
                            {/* Symbol & Company */}
                            <div className="col-span-12 md:col-span-3">
                                <div className="flex items-center gap-3">
                                    {/* Symbol Icon */}
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            border: '1px solid rgba(255, 255, 255, 0.15)',
                                        }}
                                    >
                                        <span className="text-sm font-light text-white/90">
                                            {share.symbol.substring(0, 2)}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-light text-white/90 tracking-wide">
                                            {share.symbol}
                                        </p>
                                        <p className="text-xs font-light text-white/50 tracking-wide">
                                            {share.companyName.length > 20
                                                ? share.companyName.substring(0, 20) + '...'
                                                : share.companyName}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Quantity */}
                            <div className="col-span-6 md:col-span-2">
                                <p className="text-xs font-light tracking-widest uppercase text-white/40 mb-1">
                                    Quantity
                                </p>
                                <p className="text-sm font-light text-white/70">
                                    {share.quantity}
                                </p>
                            </div>

                            {/* Current Price */}
                            <div className="col-span-6 md:col-span-2">
                                <p className="text-xs font-light tracking-widest uppercase text-white/40 mb-1">
                                    Current Price
                                </p>
                                <p className="text-sm font-light text-white/70">
                                    ₹{share.currentPrice.toLocaleString('en-IN')}
                                </p>
                            </div>

                            {/* Total Value */}
                            <div className="col-span-6 md:col-span-2">
                                <p className="text-xs font-light tracking-widest uppercase text-white/40 mb-1">
                                    Total Value
                                </p>
                                <p className="text-sm font-light text-white/90">
                                    ₹{(share.totalValue / 100000).toFixed(2)}L
                                </p>
                            </div>

                            {/* Change */}
                            <div className="col-span-6 md:col-span-2">
                                <p className="text-xs font-light tracking-widest uppercase text-white/40 mb-1">
                                    Change
                                </p>
                                <div className="flex items-center gap-1.5">
                                    {share.gainLossPercent >= 0 ? (
                                        <TrendingUp size={14} strokeWidth={1.5} className="text-green-400/80" />
                                    ) : (
                                        <TrendingDown size={14} strokeWidth={1.5} className="text-red-400/60" />
                                    )}
                                    <span className={`text-sm font-light ${share.gainLossPercent >= 0 ? 'text-green-400/80' : 'text-red-400/60'
                                        }`}>
                                        {share.gainLossPercent >= 0 ? '+' : ''}{share.gainLossPercent.toFixed(2)}%
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="col-span-12 md:col-span-1 flex items-center justify-end gap-2">
                                <button
                                    className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                                    title="Edit"
                                >
                                    <Edit2 size={16} strokeWidth={1.5} className="text-white/50 hover:text-white/70" />
                                </button>
                                <button
                                    className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                                    title="Remove"
                                >
                                    <Trash2 size={16} strokeWidth={1.5} className="text-white/50 hover:text-white/70" />
                                </button>
                            </div>
                        </div>

                        {/* Separator Line */}
                        <div
                            className="absolute bottom-0 left-6 right-6 h-px"
                            style={{
                                background: 'rgba(255, 255, 255, 0.05)'
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
