'use client';

import React from 'react';
import { useCrypto, CryptoAsset } from '@/context/CryptoContext';
import { ArrowUpRight, ArrowDownRight, MoreHorizontal, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CryptoHoldings() {
    const { holdings, loading } = useCrypto();

    if (loading) return <div className="p-8 text-white/50">Loading holdings...</div>;

    if (holdings.length === 0) {
        return (
            <div className="w-full flex items-center justify-center p-20 text-white/50">
                No crypto assets found.
            </div>
        );
    }

    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-white/5 text-xs font-medium text-white/40 uppercase tracking-wider">
                        <th className="px-6 py-4">Asset</th>
                        <th className="px-6 py-4">Price</th>
                        <th className="px-6 py-4">Balance</th>
                        <th className="px-6 py-4">Value</th>
                        <th className="px-6 py-4">Network</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {holdings.map((asset) => (
                        <HoldingRow key={asset.id} asset={asset} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function HoldingRow({ asset }: { asset: CryptoAsset }) {
    const totalValue = asset.quantity * asset.current_price;
    // Mock 24h change for visual variety since it's not in the base type yet (added to metrics but not asset)
    const mockChange = Math.random() * 10 - 4;

    return (
        <motion.tr
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group hover:bg-white/[0.02] transition-colors"
        >
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/80">
                        {asset.symbol[0]}
                    </div>
                    <div>
                        <div className="text-sm font-medium text-white">{asset.name}</div>
                        <div className="text-xs text-white/40">{asset.symbol}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="text-sm text-white/80">₹{asset.current_price.toLocaleString()}</div>
                <div className={`text-xs flex items-center gap-1 ${mockChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {mockChange >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {Math.abs(mockChange).toFixed(2)}%
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="text-sm text-white/80">{asset.quantity.toLocaleString()} {asset.symbol}</div>
            </td>
            <td className="px-6 py-4">
                <div className="text-sm font-medium text-white">₹{totalValue.toLocaleString()}</div>
            </td>
            <td className="px-6 py-4">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium bg-white/5 text-white/60 border border-white/5">
                    {asset.network}
                </span>
            </td>
            <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                        <Eye size={16} />
                    </button>
                    <button className="p-2 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                        <MoreHorizontal size={16} />
                    </button>
                </div>
            </td>
        </motion.tr>
    );
}
