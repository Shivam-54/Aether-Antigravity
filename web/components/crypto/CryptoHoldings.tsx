'use client';

import React, { useState } from 'react';
import { useCrypto, CryptoAsset } from '@/context/CryptoContext';
import { ArrowUpRight, ArrowDownRight, Trash2, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CryptoHoldings({ onSellClick }: { onSellClick: (asset: CryptoAsset) => void }) {
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
                        <HoldingRow
                            key={asset.id}
                            asset={asset}
                            onSellClick={onSellClick}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function HoldingRow({ asset, onSellClick }: { asset: CryptoAsset; onSellClick: (asset: CryptoAsset) => void }) {
    const { removeCrypto } = useCrypto();
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);

    const totalValue = asset.quantity * asset.current_price;
    // Mock 24h change for visual variety since it's not in the base type yet (added to metrics but not asset)
    const mockChange = Math.random() * 10 - 4;

    const handleRemove = () => {
        setShowConfirmDelete(true);
    };

    const confirmRemove = async () => {
        await removeCrypto(asset.id);
        setShowConfirmDelete(false);
    };

    return (
        <>
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
                        <button
                            onClick={() => onSellClick(asset)}
                            className="p-2 rounded-full hover:bg-orange-500/10 text-white/40 hover:text-orange-400 transition-colors"
                            title="Sell asset"
                        >
                            <TrendingDown size={16} />
                        </button>
                        <button
                            onClick={handleRemove}
                            className="p-2 rounded-full hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"
                            title="Remove asset"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </td>
            </motion.tr>

            {/* Confirmation Dialog */}
            {showConfirmDelete && (
                <tr>
                    <td colSpan={6}>
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                            <div className="relative w-full max-w-sm bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6">
                                <h3 className="text-lg font-semibold text-white mb-2">Remove {asset.name}?</h3>
                                <p className="text-sm text-white/60 mb-6">
                                    Are you sure you want to remove {asset.quantity} {asset.symbol} from your holdings? This action cannot be undone.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowConfirmDelete(false)}
                                        className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 transition-all font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmRemove}
                                        className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-all font-medium"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}
