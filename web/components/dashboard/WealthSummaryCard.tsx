'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface WealthSummaryCardProps {
    title: string;
    icon: React.ReactNode;
    value: number;
    gainLoss: number;
    gainLossPercent: number;
    count: number;
    color: string;
    onClick?: () => void;
}

export default function WealthSummaryCard({
    title,
    icon,
    value,
    gainLoss,
    gainLossPercent,
    count,
    color,
    onClick
}: WealthSummaryCardProps) {
    const isPositive = gainLoss >= 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            onClick={onClick}
            className={`rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-6 ${onClick ? 'cursor-pointer hover:bg-white/[0.04] transition-all' : ''
                }`}
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${color}-500/10`}>
                    {icon}
                </div>
                <div className="text-right">
                    <div className={`text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isPositive ? '+' : ''}₹{Math.abs(gainLoss).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </div>
                    <div className={`text-xs ${isPositive ? 'text-green-400/60' : 'text-red-400/60'}`}>
                        {isPositive ? '+' : ''}{gainLossPercent.toFixed(2)}%
                    </div>
                </div>
            </div>

            <div className="space-y-1">
                <h3 className="text-sm text-white/50 font-light">{title}</h3>
                <div className="text-2xl font-light text-white">
                    ₹{value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
                <div className="text-xs text-white/30">
                    {count} {count === 1 ? 'holding' : 'holdings'}
                </div>
            </div>
        </motion.div>
    );
}
