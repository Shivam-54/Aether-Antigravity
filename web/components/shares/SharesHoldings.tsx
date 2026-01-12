
'use client';

import { useState } from 'react';
import { Share } from '@/types/shares';
import { TrendingUp, TrendingDown, Edit2, Trash2, DollarSign, X } from 'lucide-react';

import { useShares } from '@/context/SharesContext';

interface SharesHoldingsProps {
    shares: Share[];
}

export default function SharesHoldings({ shares }: SharesHoldingsProps) {
    const { deleteShare, sellShare } = useShares();
    const [viewMode, setViewMode] = useState<'active' | 'sold'>('active');
    const [sellDialog, setSellDialog] = useState<{ open: boolean; share: Share | null }>({ open: false, share: null });
    const [salePrice, setSalePrice] = useState<string>('');
    const [saleDate, setSaleDate] = useState<string>(new Date().toISOString().split('T')[0]);

    const activeShares = shares.filter(s => s.status === 'active');
    const soldShares = shares.filter(s => s.status === 'sold');
    const displayShares = viewMode === 'active' ? activeShares : soldShares;

    const openSellDialog = (share: Share) => {
        setSellDialog({ open: true, share });
        setSalePrice(share.currentPrice.toString());
        setSaleDate(new Date().toISOString().split('T')[0]);
    };

    const closeSellDialog = () => {
        setSellDialog({ open: false, share: null });
        setSalePrice('');
    };

    const handleSellShare = async () => {
        if (!sellDialog.share) return;
        const price = parseFloat(salePrice);
        if (isNaN(price) || price <= 0) {
            alert('Please enter a valid sale price');
            return;
        }
        await sellShare(sellDialog.share.id, price, saleDate);
        closeSellDialog();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-light tracking-wider text-white/90 mb-2">
                        Holdings
                    </h2>
                    <p className="text-sm font-light tracking-wide text-white/50">
                        Your equity portfolio inventory
                    </p>
                </div>

                {/* View Toggle */}
                <div className="flex gap-2 p-1 rounded-lg" style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <button
                        onClick={() => setViewMode('active')}
                        className={`px-4 py-2 rounded-md text-sm font-light transition-all duration-200 ${viewMode === 'active'
                            ? 'bg-white/10 text-white/90'
                            : 'text-white/50 hover:text-white/70'
                            }`}
                    >
                        Active ({activeShares.length})
                    </button>
                    <button
                        onClick={() => setViewMode('sold')}
                        className={`px-4 py-2 rounded-md text-sm font-light transition-all duration-200 ${viewMode === 'sold'
                            ? 'bg-white/10 text-white/90'
                            : 'text-white/50 hover:text-white/70'
                            }`}
                    >
                        Sold ({soldShares.length})
                    </button>
                </div>
            </div>

            {/* Holdings Table */}
            {displayShares.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm text-center">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                        <TrendingUp className="w-8 h-8 text-white/20" />
                    </div>
                    <h3 className="text-xl font-light text-white mb-2">
                        {viewMode === 'active' ? 'No Active Shares' : 'No Sold Shares'}
                    </h3>
                    <p className="text-white/40 max-w-sm mb-6">
                        {viewMode === 'active'
                            ? 'Your portfolio is currently empty. Add your first share to start tracking your equity investments.'
                            : 'You haven\'t sold any shares yet. Sales will appear here once you sell shares from your active holdings.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {displayShares.map((share) => (
                        <div
                            key={share.id}
                            className="relative p-6 rounded-2xl overflow-hidden group transition-all duration-300 hover:scale-[1.01]"
                            style={{
                                background: viewMode === 'sold' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                boxShadow: '0 0 30px 0 rgba(255, 255, 255, 0.05)',
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)',
                                opacity: viewMode === 'sold' ? 0.7 : 1
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

                                {/* Price */}
                                <div className="col-span-6 md:col-span-2">
                                    <p className="text-xs font-light tracking-widest uppercase text-white/40 mb-1">
                                        {viewMode === 'sold' ? 'Sale Price' : 'Current Price'}
                                    </p>
                                    <p className="text-sm font-light text-white/70">
                                        ₹{viewMode === 'sold' && share.salePrice
                                            ? share.salePrice.toLocaleString('en-IN')
                                            : share.currentPrice.toLocaleString('en-IN')}
                                    </p>
                                </div>

                                {/* Total Value */}
                                <div className="col-span-6 md:col-span-2">
                                    <p className="text-xs font-light tracking-widest uppercase text-white/40 mb-1">
                                        Total Value
                                    </p>
                                    <p className="text-sm font-light text-white/90">
                                        ₹{((viewMode === 'sold' && share.saleTotalValue
                                            ? share.saleTotalValue
                                            : share.totalValue) / 100000).toFixed(2)}L
                                    </p>
                                </div>

                                {/* Profit/Loss or Change */}
                                <div className="col-span-6 md:col-span-2">
                                    <p className="text-xs font-light tracking-widest uppercase text-white/40 mb-1">
                                        {viewMode === 'sold' ? 'Profit/Loss' : 'Change'}
                                    </p>
                                    <div className="flex items-center gap-1.5">
                                        {(viewMode === 'sold' ? (share.profitLoss || 0) : share.gainLoss) >= 0 ? (
                                            <TrendingUp size={14} strokeWidth={1.5} className="text-green-400/80" />
                                        ) : (
                                            <TrendingDown size={14} strokeWidth={1.5} className="text-red-400/60" />
                                        )}
                                        <div className="flex flex-col">
                                            <span className={`text-sm font-light ${(viewMode === 'sold' ? (share.profitLoss || 0) : share.gainLoss) >= 0
                                                ? 'text-green-400/80'
                                                : 'text-red-400/60'
                                                }`}>
                                                {viewMode === 'sold'
                                                    ? `₹${Math.abs(share.profitLoss || 0).toLocaleString('en-IN')}`
                                                    : `${share.gainLossPercent >= 0 ? '+' : ''}${share.gainLossPercent.toFixed(2)}%`}
                                            </span>
                                            {viewMode === 'sold' && share.saleDate && (
                                                <span className="text-xs text-white/40">
                                                    {new Date(share.saleDate).toLocaleDateString('en-IN')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                {viewMode === 'active' && (
                                    <div className="col-span-12 md:col-span-1 flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => openSellDialog(share)}
                                            className="p-2 rounded-lg hover:bg-white/5 transition-colors group/btn"
                                            title="Sell Share"
                                        >
                                            <DollarSign size={16} strokeWidth={1.5} className="text-white/50 group-hover/btn:text-green-400 transition-colors" />
                                        </button>
                                        <button
                                            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                                            title="Edit"
                                        >
                                            <Edit2 size={16} strokeWidth={1.5} className="text-white/50 hover:text-white/70" />
                                        </button>
                                        <button
                                            onClick={() => deleteShare(share.id)}
                                            className="p-2 rounded-lg hover:bg-white/5 transition-colors group/btn"
                                            title="Remove"
                                        >
                                            <Trash2 size={16} strokeWidth={1.5} className="text-white/50 group-hover/btn:text-red-400 transition-colors" />
                                        </button>
                                    </div>
                                )}
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
            )}

            {/* Sell Dialog */}
            {sellDialog.open && sellDialog.share && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div
                        className="relative w-full max-w-md p-8 rounded-2xl"
                        style={{
                            background: 'rgba(0, 0, 0, 0.8)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(20px)',
                        }}
                    >
                        <button
                            onClick={closeSellDialog}
                            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/5 transition-colors"
                        >
                            <X size={20} className="text-white/50" />
                        </button>

                        <h3 className="text-xl font-light text-white mb-6">
                            Sell {sellDialog.share.symbol}
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-light text-white/70 block mb-2">
                                    Sale Price (per share)
                                </label>
                                <input
                                    type="number"
                                    value={salePrice}
                                    onChange={(e) => setSalePrice(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-white/30 focus:outline-none"
                                    placeholder="Enter sale price"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-light text-white/70 block mb-2">
                                    Sale Date
                                </label>
                                <input
                                    type="date"
                                    value={saleDate}
                                    onChange={(e) => setSaleDate(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-white/30 focus:outline-none"
                                />
                            </div>

                            <div className="pt-4 border-t border-white/10">
                                <div className="flex justify-between text-sm text-white/50 mb-2">
                                    <span>Quantity:</span>
                                    <span>{sellDialog.share.quantity}</span>
                                </div>
                                <div className="flex justify-between text-sm text-white/50 mb-2">
                                    <span>Total Sale Value:</span>
                                    <span>₹{(sellDialog.share.quantity * parseFloat(salePrice || '0')).toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-base text-white/90 font-medium">
                                    <span>Profit/Loss:</span>
                                    <span className={
                                        (sellDialog.share.quantity * parseFloat(salePrice || '0')) - sellDialog.share.totalInvested >= 0
                                            ? 'text-green-400'
                                            : 'text-red-400'
                                    }>
                                        ₹{((sellDialog.share.quantity * parseFloat(salePrice || '0')) - sellDialog.share.totalInvested).toLocaleString('en-IN')}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={closeSellDialog}
                                    className="flex-1 px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSellShare}
                                    className="flex-1 px-4 py-3 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-colors"
                                >
                                    Confirm Sale
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
