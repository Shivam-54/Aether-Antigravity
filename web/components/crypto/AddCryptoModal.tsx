'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Plus, Search, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CryptoAsset } from '@/context/CryptoContext';
import { searchCrypto, getCryptoPrice, type CryptoSearchResult } from '@/lib/api/coincap';

interface AddCryptoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (crypto: CryptoAsset) => Promise<void>;
}

export default function AddCryptoModal({ isOpen, onClose, onAdd }: AddCryptoModalProps) {
    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<CryptoSearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedCrypto, setSelectedCrypto] = useState<CryptoSearchResult | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        symbol: '',
        name: '',
        network: '',
        quantity: '',
        avgBuyPrice: '',
        currentPrice: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRefreshingPrice, setIsRefreshingPrice] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const networks = [
        'Bitcoin',
        'Ethereum',
        'Solana',
        'Cardano',
        'Polkadot',
        'Avalanche',
        'Polygon',
        'Binance Smart Chain',
        'Arbitrum',
        'Optimism',
        'Base'
    ];

    // Debounced search
    useEffect(() => {
        if (!searchQuery.trim() || searchQuery.length < 2) {
            setSearchResults([]);
            setShowDropdown(false);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const results = await searchCrypto(searchQuery);
                setSearchResults(results);
                setShowDropdown(true);
            } catch (error) {
                console.error('Search error:', error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSelectCrypto = (crypto: CryptoSearchResult) => {
        setSelectedCrypto(crypto);
        setSearchQuery('');
        setShowDropdown(false);
        setFormData(prev => ({
            ...prev,
            symbol: crypto.symbol,
            name: crypto.name,
            currentPrice: crypto.priceInr.toFixed(2),
        }));
    };

    const handleRefreshPrice = async () => {
        if (!selectedCrypto) return;

        setIsRefreshingPrice(true);
        try {
            const { priceInr } = await getCryptoPrice(selectedCrypto.id);
            setFormData(prev => ({
                ...prev,
                currentPrice: priceInr.toFixed(2),
            }));
        } catch (error) {
            console.error('Error refreshing price:', error);
        } finally {
            setIsRefreshingPrice(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.symbol.trim()) newErrors.symbol = 'Symbol is required';
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.network) newErrors.network = 'Network is required';
        if (!formData.quantity || Number(formData.quantity) <= 0) {
            newErrors.quantity = 'Valid quantity is required';
        }
        if (!formData.avgBuyPrice || Number(formData.avgBuyPrice) <= 0) {
            newErrors.avgBuyPrice = 'Valid buy price is required';
        }
        if (!formData.currentPrice || Number(formData.currentPrice) <= 0) {
            newErrors.currentPrice = 'Valid current price is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setIsSubmitting(true);

        try {
            const quantity = Number(formData.quantity);
            const avgBuyPrice = Number(formData.avgBuyPrice);
            const currentPrice = Number(formData.currentPrice);

            const newCrypto: CryptoAsset = {
                id: `crypto-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                symbol: formData.symbol.toUpperCase().trim(),
                name: formData.name.trim(),
                quantity,
                current_price: currentPrice,
                purchase_price_avg: avgBuyPrice,
                network: formData.network,
            };

            await onAdd(newCrypto);

            // Reset form
            setFormData({
                symbol: '',
                name: '',
                network: '',
                quantity: '',
                avgBuyPrice: '',
                currentPrice: '',
            });
            setSelectedCrypto(null);
            setErrors({});
            onClose();
        } catch (error) {
            console.error('Error adding crypto:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setFormData({
                symbol: '',
                name: '',
                network: '',
                quantity: '',
                avgBuyPrice: '',
                currentPrice: '',
            });
            setSelectedCrypto(null);
            setSearchQuery('');
            setSearchResults([]);
            setShowDropdown(false);
            setErrors({});
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-8"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-light text-white">Add New Crypto</h2>
                                <p className="text-sm text-white/40 mt-1">Search and add cryptocurrency to your portfolio</p>
                            </div>
                            <button
                                onClick={handleClose}
                                disabled={isSubmitting}
                                className="p-2 rounded-full hover:bg-white/5 transition-colors disabled:opacity-50"
                            >
                                <X className="w-5 h-5 text-white/40 hover:text-white/70" />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="mb-6 relative">
                            <label className="block text-sm text-white/60 mb-2">
                                Search Cryptocurrency
                            </label>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Bitcoin, Ethereum, Solana..."
                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-white/20 transition-colors"
                                    autoComplete="off"
                                />
                                {isSearching && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    </div>
                                )}
                            </div>

                            {/* Search Results Dropdown */}
                            {showDropdown && searchResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 rounded-xl bg-white/[0.05] backdrop-blur-xl border border-white/10 overflow-hidden z-10 max-h-80 overflow-y-auto">
                                    {searchResults.map((crypto) => (
                                        <button
                                            key={crypto.id}
                                            type="button"
                                            onClick={() => handleSelectCrypto(crypto)}
                                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex flex-col">
                                                        <span className="text-white font-medium">{crypto.name}</span>
                                                        <span className="text-white/40 text-sm">{crypto.symbol.toUpperCase()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-white font-medium">
                                                    ₹{crypto.priceInr.toLocaleString()}
                                                </div>
                                                <div className={`text-xs flex items-center justify-end gap-1 ${crypto.changePercent24Hr >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {crypto.changePercent24Hr >= 0 ? (
                                                        <TrendingUp className="w-3 h-3" />
                                                    ) : (
                                                        <TrendingDown className="w-3 h-3" />
                                                    )}
                                                    {Math.abs(crypto.changePercent24Hr).toFixed(2)}%
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {showDropdown && searchQuery && searchResults.length === 0 && !isSearching && (
                                <div className="absolute top-full left-0 right-0 mt-2 rounded-xl bg-white/[0.05] backdrop-blur-xl border border-white/10 p-4 text-center text-white/40">
                                    No cryptocurrencies found
                                </div>
                            )}
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Symbol and Name - Always visible and editable */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-white/60 mb-2">
                                        Symbol <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="symbol"
                                        value={formData.symbol}
                                        onChange={handleChange}
                                        placeholder="BTC, ETH, SOL, etc."
                                        className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${errors.symbol ? 'border-red-400/50' : 'border-white/10'
                                            } text-white placeholder:text-white/30 outline-none focus:border-white/20 transition-colors`}
                                        disabled={isSubmitting}
                                    />
                                    {errors.symbol && (
                                        <p className="text-red-400 text-xs mt-1">{errors.symbol}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm text-white/60 mb-2">
                                        Name <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Bitcoin, Ethereum"
                                        className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${errors.name ? 'border-red-400/50' : 'border-white/10'
                                            } text-white placeholder:text-white/30 outline-none focus:border-white/20 transition-colors`}
                                        disabled={isSubmitting}
                                    />
                                    {errors.name && (
                                        <p className="text-red-400 text-xs mt-1">{errors.name}</p>
                                    )}
                                </div>
                            </div>

                            {/* Network */}
                            <div>
                                <label className="block text-sm text-white/60 mb-2">
                                    Network <span className="text-red-400">*</span>
                                </label>
                                <select
                                    name="network"
                                    value={formData.network}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${errors.network ? 'border-red-400/50' : 'border-white/10'
                                        } text-white outline-none focus:border-white/20 transition-colors`}
                                    disabled={isSubmitting}
                                >
                                    <option value="" className="bg-[#0a0a0a]">Select network...</option>
                                    {networks.map(network => (
                                        <option key={network} value={network} className="bg-[#0a0a0a]">
                                            {network}
                                        </option>
                                    ))}
                                </select>
                                {errors.network && (
                                    <p className="text-red-400 text-xs mt-1">{errors.network}</p>
                                )}
                            </div>

                            {/* Quantity and Prices */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm text-white/60 mb-2">
                                        Quantity <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleChange}
                                        placeholder="1.5"
                                        min="0.00000001"
                                        step="any"
                                        className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${errors.quantity ? 'border-red-400/50' : 'border-white/10'
                                            } text-white placeholder:text-white/30 outline-none focus:border-white/20 transition-colors`}
                                        disabled={isSubmitting}
                                    />
                                    {errors.quantity && (
                                        <p className="text-red-400 text-xs mt-1">{errors.quantity}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm text-white/60 mb-2">
                                        Avg Buy Price (₹) <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="avgBuyPrice"
                                        value={formData.avgBuyPrice}
                                        onChange={handleChange}
                                        placeholder="3500000"
                                        min="0.01"
                                        step="0.01"
                                        className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${errors.avgBuyPrice ? 'border-red-400/50' : 'border-white/10'
                                            } text-white placeholder:text-white/30 outline-none focus:border-white/20 transition-colors`}
                                        disabled={isSubmitting}
                                    />
                                    {errors.avgBuyPrice && (
                                        <p className="text-red-400 text-xs mt-1">{errors.avgBuyPrice}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm text-white/60 mb-2 flex items-center justify-between">
                                        <span>Current Price (₹) <span className="text-red-400">*</span></span>
                                        {selectedCrypto && (
                                            <button
                                                type="button"
                                                onClick={handleRefreshPrice}
                                                disabled={isRefreshingPrice}
                                                className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                                            >
                                                <RefreshCw className={`w-3 h-3 ${isRefreshingPrice ? 'animate-spin' : ''}`} />
                                                Refresh
                                            </button>
                                        )}
                                    </label>
                                    <input
                                        type="number"
                                        name="currentPrice"
                                        value={formData.currentPrice}
                                        onChange={handleChange}
                                        placeholder="3850000"
                                        min="0.01"
                                        step="0.01"
                                        className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${errors.currentPrice ? 'border-red-400/50' : 'border-white/10'
                                            } text-white placeholder:text-white/30 outline-none focus:border-white/20 transition-colors`}
                                        disabled={isSubmitting}
                                    />
                                    {errors.currentPrice && (
                                        <p className="text-red-400 text-xs mt-1">{errors.currentPrice}</p>
                                    )}
                                </div>
                            </div>

                            {/* Calculated Preview - Show Total Value */}
                            {formData.quantity && formData.currentPrice && (
                                <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-white/60">Total Value</div>
                                        <div className="text-xl font-medium text-white">
                                            ₹{(Number(formData.quantity) * Number(formData.currentPrice)).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Preview Calculations with Gain/Loss */}
                            {formData.quantity && formData.avgBuyPrice && formData.currentPrice && (
                                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                                    <h3 className="text-sm text-white/60 mb-3">Investment Summary</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <div className="text-white/40 text-xs mb-1">Total Invested</div>
                                            <div className="text-white font-medium">
                                                ₹{(Number(formData.quantity) * Number(formData.avgBuyPrice)).toLocaleString()}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-white/40 text-xs mb-1">Current Value</div>
                                            <div className="text-white font-medium">
                                                ₹{(Number(formData.quantity) * Number(formData.currentPrice)).toLocaleString()}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-white/40 text-xs mb-1">Gain/Loss</div>
                                            <div className={`font-medium ${Number(formData.currentPrice) >= Number(formData.avgBuyPrice)
                                                ? 'text-green-400'
                                                : 'text-red-400'
                                                }`}>
                                                {Number(formData.currentPrice) >= Number(formData.avgBuyPrice) ? '+' : ''}
                                                ₹{((Number(formData.quantity) * Number(formData.currentPrice)) -
                                                    (Number(formData.quantity) * Number(formData.avgBuyPrice))).toLocaleString()}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-white/40 text-xs mb-1">Return %</div>
                                            <div className={`font-medium ${Number(formData.currentPrice) >= Number(formData.avgBuyPrice)
                                                ? 'text-green-400'
                                                : 'text-red-400'
                                                }`}>
                                                {Number(formData.currentPrice) >= Number(formData.avgBuyPrice) ? '+' : ''}
                                                {(((Number(formData.currentPrice) - Number(formData.avgBuyPrice)) /
                                                    Number(formData.avgBuyPrice)) * 100).toFixed(2)}%
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    disabled={isSubmitting}
                                    className="flex-1 px-6 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white/90 hover:bg-white/5 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/15 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            Adding...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-4 h-4" />
                                            Add to Portfolio
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
