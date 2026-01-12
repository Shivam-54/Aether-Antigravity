'use client';

import { useEffect, useState } from 'react';
import { useSource } from '@/context/SourceContext';
import { useShares } from '@/context/SharesContext';
import { TrendingUp, TrendingDown, Plus, Trash2, DollarSign, X, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import AddShareModal from '@/components/shares/AddShareModal';

export default function SharesHoldingsPage() {
    const { setActiveSource } = useSource();
    const { shares, loading, addShare, deleteShare, sellShare } = useShares();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'active' | 'sold'>('active');
    const [sellDialog, setSellDialog] = useState<{ open: boolean; share: any | null }>({ open: false, share: null });
    const [salePrice, setSalePrice] = useState<string>('');
    const [saleDate, setSaleDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [sharesWithLivePrices, setSharesWithLivePrices] = useState<any[]>([]);
    const [isRefreshingPrices, setIsRefreshingPrices] = useState(false);
    const [lastPriceUpdate, setLastPriceUpdate] = useState<Date | null>(null);

    useEffect(() => {
        setActiveSource('Shares');
    }, [setActiveSource]);

    // Helper: Get cached prices from localStorage
    const getCachedPrices = () => {
        try {
            const cached = localStorage.getItem('share_prices_cache');
            if (!cached) return null;
            const data = JSON.parse(cached);
            const cacheAge = Date.now() - data.timestamp;
            const TEN_MINUTES = 10 * 60 * 1000;
            if (cacheAge > TEN_MINUTES) return null;
            return data.prices;
        } catch {
            return null;
        }
    };

    // Helper: Save prices to cache
    const cachePrices = (prices: Record<string, number>) => {
        try {
            localStorage.setItem('share_prices_cache', JSON.stringify({
                timestamp: Date.now(),
                prices
            }));
        } catch (e) {
            console.error('Failed to cache prices:', e);
        }
    };

    // Refresh prices from API
    const refreshPrices = async (forceRefresh = false) => {
        const activeSharesList = shares.filter(s => s.status === 'active');
        if (activeSharesList.length === 0) {
            setSharesWithLivePrices([]);
            return;
        }

        // Check cache first
        if (!forceRefresh) {
            const cachedPrices = getCachedPrices();
            if (cachedPrices) {
                const updated = activeSharesList.map(share => {
                    const livePrice = cachedPrices[share.symbol];
                    if (livePrice) {
                        const totalValue = share.quantity * livePrice;
                        const gainLoss = totalValue - share.totalInvested;
                        const gainLossPercent = (gainLoss / share.totalInvested) * 100;
                        return { ...share, currentPrice: livePrice, totalValue, gainLoss, gainLossPercent };
                    }
                    return share;
                });
                setSharesWithLivePrices(updated);
                return;
            }
        }

        // Fetch from Yahoo Finance API (via server route)
        setIsRefreshingPrices(true);

        try {
            const symbols = activeSharesList.map(s => s.symbol);

            // Call server-side API route
            const response = await fetch('/api/stock-prices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symbols })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch prices from server');
            }

            const data = await response.json();
            const priceMap = data.prices || {};

            // Update shares with new prices
            const updated = activeSharesList.map(share => {
                const livePrice = priceMap[share.symbol];
                if (livePrice) {
                    const totalValue = share.quantity * livePrice;
                    const gainLoss = totalValue - share.totalInvested;
                    const gainLossPercent = (gainLoss / share.totalInvested) * 100;
                    return { ...share, currentPrice: livePrice, totalValue, gainLoss, gainLossPercent };
                }
                return share;
            });

            setSharesWithLivePrices(updated);
            if (Object.keys(priceMap).length > 0) {
                cachePrices(priceMap);
                setLastPriceUpdate(new Date());
            }
        } catch (error) {
            console.error('Error refreshing prices:', error);
        } finally {
            setIsRefreshingPrices(false);
        }
    };

    // Auto-refresh on mount and when shares change
    useEffect(() => {
        refreshPrices();
    }, [shares]);

    // Use live prices if available, otherwise fall back to stored prices
    const activeShares = sharesWithLivePrices.length > 0 ? sharesWithLivePrices : shares.filter(s => s.status === 'active');
    const soldShares = shares.filter(s => s.status === 'sold');
    const displayShares = viewMode === 'active' ? activeShares : soldShares;

    const openSellDialog = (share: any) => {
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

    if (loading) {
        return <div className="p-8 text-white/50">Loading shares data...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto p-8 w-full space-y-8">
            {/* Header */}
            <header>
                <h1 className="text-3xl font-light text-white tracking-tight">Share Holdings</h1>
                <p className="text-sm text-white/40">Manage your stock portfolio and add new holdings</p>
            </header>

            {/* Holdings Table */}
            <div className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-light text-white">Portfolio Holdings</h2>
                        <p className="text-sm text-white/40">Detailed breakdown of your stock holdings</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Active/Sold Toggle */}
                        <div className="flex gap-2 p-1 rounded-lg" style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                            <button
                                onClick={() => setViewMode('active')}
                                className={`px-3 py-1.5 rounded-md text-xs font-light transition-all duration-200 ${viewMode === 'active'
                                    ? 'bg-white/10 text-white/90'
                                    : 'text-white/50 hover:text-white/70'
                                    }`}
                            >
                                Active ({activeShares.length})
                            </button>
                            <button
                                onClick={() => setViewMode('sold')}
                                className={`px-3 py-1.5 rounded-md text-xs font-light transition-all duration-200 ${viewMode === 'sold'
                                    ? 'bg-white/10 text-white/90'
                                    : 'text-white/50 hover:text-white/70'
                                    }`}
                            >
                                Sold ({soldShares.length})
                            </button>
                        </div>
                        {/* Refresh Prices Button */}
                        <button
                            onClick={() => refreshPrices(true)}
                            disabled={isRefreshingPrices}
                            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white/90 hover:bg-white/10 transition-colors flex items-center gap-2 text-xs disabled:opacity-50"
                            title="Refresh live prices"
                        >
                            <RefreshCw size={14} className={isRefreshingPrices ? 'animate-spin' : ''} />
                            {isRefreshingPrices ? 'Updating...' : 'Refresh'}
                        </button>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/15 transition-colors flex items-center gap-2 text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Add Share
                        </button>
                    </div>
                </div>

                {displayShares.length === 0 ? (
                    <div className="p-8 text-center text-white/50">
                        {viewMode === 'active' ? 'No active shares found.' : 'No sold shares found.'}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 text-xs font-medium text-white/40 uppercase tracking-wider">
                                    <th className="px-6 py-4">Company</th>
                                    <th className="px-6 py-4">Sector</th>
                                    <th className="px-6 py-4">Quantity</th>
                                    <th className="px-6 py-4">Avg Buy Price</th>
                                    <th className="px-6 py-4">{viewMode === 'sold' ? 'Sale Price' : 'Current Price'}</th>
                                    <th className="px-6 py-4">Total Value</th>
                                    <th className="px-6 py-4">{viewMode === 'sold' ? 'Profit/Loss' : 'Gain/Loss'}</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {displayShares.map((share) => (
                                    <ShareRow
                                        key={share.id}
                                        share={share}
                                        onDelete={deleteShare}
                                        onSell={openSellDialog}
                                        viewMode={viewMode}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add Share Modal */}
            <AddShareModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={addShare}
            />

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

function ShareRow({ share, onDelete, onSell, viewMode }: { share: any, onDelete: (id: string) => void, onSell: (share: any) => void, viewMode: 'active' | 'sold' }) {
    const isPositive = viewMode === 'sold' ? (share.profitLoss || 0) >= 0 : share.gainLoss >= 0;

    return (
        <motion.tr
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group hover:bg-white/[0.02] transition-colors"
        >
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/80">
                        {share.symbol.substring(0, 2)}
                    </div>
                    <div>
                        <div className="text-sm font-medium text-white">{share.companyName}</div>
                        <div className="text-xs text-white/40">{share.symbol}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className="text-sm text-white/60">{share.sector}</span>
            </td>
            <td className="px-6 py-4">
                <span className="text-sm text-white/80">{share.quantity}</span>
            </td>
            <td className="px-6 py-4">
                <span className="text-sm text-white/80">₹{share.avgBuyPrice.toLocaleString()}</span>
            </td>
            <td className="px-6 py-4">
                <span className="text-sm text-white/80">
                    ₹{viewMode === 'sold' && share.salePrice ? share.salePrice.toLocaleString() : share.currentPrice.toLocaleString()}
                </span>
            </td>
            <td className="px-6 py-4">
                <span className="text-sm font-medium text-white">
                    ₹{(viewMode === 'sold' && share.saleTotalValue ? share.saleTotalValue : share.totalValue).toLocaleString()}
                </span>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    {isPositive ? <TrendingUp size={14} className="text-green-400" /> : <TrendingDown size={14} className="text-red-400" />}
                    <div>
                        <div className={`text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            {viewMode === 'sold'
                                ? `${isPositive ? '+' : ''}₹${Math.abs(share.profitLoss || 0).toLocaleString()}`
                                : `${isPositive ? '+' : ''}₹${Math.abs(share.gainLoss).toLocaleString()}`
                            }
                        </div>
                        <div className={`text-xs ${isPositive ? 'text-green-400/60' : 'text-red-400/60'}`}>
                            {viewMode === 'sold' && share.saleDate
                                ? new Date(share.saleDate).toLocaleDateString('en-IN')
                                : `${isPositive ? '+' : ''}${share.gainLossPercent.toFixed(2)}%`
                            }
                        </div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                {viewMode === 'active' && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onSell(share)}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors group/btn"
                            title="Sell Share"
                        >
                            <DollarSign size={16} className="text-white/40 group-hover/btn:text-green-400 transition-colors" />
                        </button>
                        <button
                            onClick={() => onDelete(share.id)}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors group/btn"
                            title="Remove Share"
                        >
                            <Trash2 size={16} className="text-white/40 group-hover/btn:text-red-400 transition-colors" />
                        </button>
                    </div>
                )}
            </td>
        </motion.tr>
    );
}
