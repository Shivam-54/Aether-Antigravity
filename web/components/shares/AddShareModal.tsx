'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Plus, Search, Loader2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Share, HoldingDuration } from '@/types/shares';

interface StockSearchResult {
    symbol: string;
    name: string;
    exchange: string;
    type: string;
}

interface AddShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (share: Share) => Promise<void>;
}

export default function AddShareModal({ isOpen, onClose, onAdd }: AddShareModalProps) {
    const [formData, setFormData] = useState({
        sector: '',
        symbol: '',
        companyName: '',
        quantity: '',
        avgBuyPrice: '',
        currentPrice: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetchingPrice, setIsFetchingPrice] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Company search states
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<StockSearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchError, setSearchError] = useState<string>('');
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const sectors = [
        'Communication Services',
        'Consumer Discretionary',
        'Consumer Staples',
        'Energy',
        'Financials',
        'Healthcare',
        'Industrials',
        'Information Technology',
        'Materials',
        'Real Estate',
        'Utilities',
        'Aerospace & Defense',
        'Automobiles & Components',
        'Banks',
        'Biotechnology',
        'Capital Goods',
        'Commercial Services',
        'Consumer Durables',
        'Food & Beverages',
        'Insurance',
        'Media & Entertainment',
        'Pharmaceuticals',
        'Retail',
        'Semiconductors',
        'Software & Services',
        'Telecommunication Services',
        'Transportation',
        'ETF/Index Fund',
        'Other'
    ];

    // Auto-fetch price when stock is selected
    const fetchPrice = async (symbol: string) => {
        setIsFetchingPrice(true);
        try {
            const response = await fetch(`/api/stock-details?symbol=${encodeURIComponent(symbol)}`);

            if (!response.ok) {
                throw new Error('Failed to fetch stock details');
            }

            const data = await response.json();

            if (data.price) {
                setFormData(prev => ({
                    ...prev,
                    currentPrice: data.price.toString(),
                    avgBuyPrice: prev.avgBuyPrice || data.price.toString()
                }));
            }

        } catch (error) {
            console.error('Error fetching price:', error);
        } finally {
            setIsFetchingPrice(false);
        }
    };

    // Debounced search effect - only active when sector is selected
    useEffect(() => {
        if (!formData.sector) {
            setSearchResults([]);
            setShowDropdown(false);
            return;
        }

        if (!searchQuery.trim()) {
            setSearchResults([]);
            setShowDropdown(false);
            return;
        }

        // Clear previous timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Set new timeout for debounced search
        searchTimeoutRef.current = setTimeout(async () => {
            setIsSearching(true);
            setSearchError('');

            try {
                const response = await fetch(`/api/stock-search?q=${encodeURIComponent(searchQuery)}`);

                if (!response.ok) {
                    throw new Error('Search failed');
                }

                const data = await response.json();
                const results = data.results || [];

                setSearchResults(results);
                setShowDropdown(results.length > 0);

                if (results.length === 0 && searchQuery.trim().length >= 2) {
                    setSearchError('No stocks found. Try a different search term.');
                }
            } catch (error) {
                console.error('Search error:', error);
                setSearchError('Search failed. Please try again.');
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300); // 300ms debounce

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchQuery, formData.sector]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);

        // Clear form fields when search query changes
        if (formData.symbol || formData.companyName) {
            setFormData(prev => ({
                ...prev,
                symbol: '',
                companyName: '',
            }));
        }
    };

    const handleCompanySelect = (stock: StockSearchResult) => {
        setSearchQuery(`${stock.symbol} - ${stock.name}`);
        setFormData(prev => ({
            ...prev,
            symbol: stock.symbol,
            companyName: stock.name,
        }));
        setShowDropdown(false);
        setSearchResults([]);

        // Clear error for symbol and company name
        if (errors.symbol || errors.companyName) {
            setErrors(prev => ({
                ...prev,
                symbol: '',
                companyName: '',
            }));
        }

        // Fetch price
        fetchPrice(stock.symbol);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear search when sector changes
        if (name === 'sector') {
            setSearchQuery('');
            setSearchResults([]);
            setFormData(prev => ({
                ...prev,
                sector: value,
                symbol: '',
                companyName: '',
            }));
        }

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.sector) newErrors.sector = 'Sector is required';
        if (!formData.symbol.trim()) newErrors.symbol = 'Please select a stock';
        if (!formData.companyName.trim()) newErrors.companyName = 'Please select a stock';
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
            const totalInvested = quantity * avgBuyPrice;
            const totalValue = quantity * currentPrice;
            const gainLoss = totalValue - totalInvested;
            const gainLossPercent = (gainLoss / totalInvested) * 100;

            const acquisitionDate = new Date().toISOString();
            const holdingDuration: HoldingDuration = 'Short';

            const newShare: Share = {
                id: `share-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                symbol: formData.symbol.toUpperCase().trim(),
                companyName: formData.companyName.trim(),
                sector: formData.sector,
                quantity,
                avgBuyPrice,
                currentPrice,
                totalValue,
                totalInvested,
                gainLoss,
                gainLossPercent,
                acquisitionDate,
                holdingDuration,
                status: 'active'
            };

            await onAdd(newShare);

            // Reset form
            setFormData({
                sector: '',
                symbol: '',
                companyName: '',
                quantity: '',
                avgBuyPrice: '',
                currentPrice: '',
            });
            setErrors({});
            setSearchQuery('');
            setSearchResults([]);
            setShowDropdown(false);
            setSearchError('');
            onClose();
        } catch (error) {
            console.error('Error adding share:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setFormData({
                sector: '',
                symbol: '',
                companyName: '',
                quantity: '',
                avgBuyPrice: '',
                currentPrice: '',
            });
            setErrors({});
            setSearchQuery('');
            setSearchResults([]);
            setShowDropdown(false);
            setSearchError('');
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
                                <h2 className="text-2xl font-light text-white">Add New Share</h2>
                                <p className="text-sm text-white/40 mt-1">Select sector, search stock, and enter details</p>
                            </div>
                            <button
                                onClick={handleClose}
                                disabled={isSubmitting}
                                className="p-2 rounded-full hover:bg-white/5 transition-colors disabled:opacity-50"
                            >
                                <X className="w-5 h-5 text-white/40 hover:text-white/70" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* STEP 1: Sector Selection */}
                            <div>
                                <label className="block text-sm text-white/60 mb-2">
                                    <span className="text-white/90 font-medium">Step 1:</span> Select Sector <span className="text-red-400">*</span>
                                </label>
                                <select
                                    name="sector"
                                    value={formData.sector}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${errors.sector ? 'border-red-400/50' : 'border-white/10'
                                        } text-white outline-none focus:border-white/20 transition-colors`}
                                    disabled={isSubmitting}
                                >
                                    <option value="" className="bg-[#0a0a0a]">Select sector first...</option>
                                    {sectors.map(sector => (
                                        <option key={sector} value={sector} className="bg-[#0a0a0a]">
                                            {sector}
                                        </option>
                                    ))}
                                </select>
                                {errors.sector && (
                                    <p className="text-red-400 text-xs mt-1">{errors.sector}</p>
                                )}
                            </div>

                            {/* STEP 2: Stock Search (only enabled when sector is selected) */}
                            <div className="relative" ref={dropdownRef}>
                                <label className="block text-sm text-white/60 mb-2">
                                    <span className="text-white/90 font-medium">Step 2:</span> Search Stock <span className="text-red-400">*</span>
                                    {!formData.sector && <span className="text-white/30 ml-2">(Select sector first)</span>}
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        onFocus={() => {
                                            if (searchResults.length > 0) {
                                                setShowDropdown(true);
                                            }
                                        }}
                                        placeholder={formData.sector ? "Type company name or symbol..." : "Select a sector first"}
                                        disabled={!formData.sector || isSubmitting}
                                        className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border ${(errors.symbol || errors.companyName) ? 'border-red-400/50' : 'border-white/10'
                                            } text-white placeholder:text-white/30 outline-none focus:border-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                                    />
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                    {isSearching && (
                                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 animate-spin" />
                                    )}
                                </div>
                                {(errors.symbol || errors.companyName) && (
                                    <p className="text-red-400 text-xs mt-1">
                                        {errors.symbol || errors.companyName}
                                    </p>
                                )}
                                {searchError && (
                                    <p className="text-amber-400 text-xs mt-1">{searchError}</p>
                                )}

                                {/* Autocomplete Dropdown */}
                                <AnimatePresence>
                                    {showDropdown && searchResults.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute z-10 w-full mt-2 rounded-xl border border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl overflow-hidden shadow-2xl max-h-60 overflow-y-auto"
                                        >
                                            {searchResults.map((stock, index) => (
                                                <button
                                                    key={`${stock.symbol}-${index}`}
                                                    type="button"
                                                    onClick={() => handleCompanySelect(stock)}
                                                    className="w-full px-4 py-3 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="text-sm font-medium text-white">
                                                                {stock.symbol}
                                                            </div>
                                                            <div className="text-xs text-white/60 truncate">
                                                                {stock.name}
                                                            </div>
                                                        </div>
                                                        <div className="text-xs text-white/40">
                                                            {stock.exchange}
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Selected Stock Display */}
                                {formData.symbol && formData.companyName && (
                                    <div className="mt-2 p-3 rounded-xl bg-white/5 border border-white/10">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/80">
                                                {formData.symbol.substring(0, 2)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-white">
                                                    {formData.symbol}
                                                </div>
                                                <div className="text-xs text-white/60">
                                                    {formData.companyName}
                                                </div>
                                            </div>
                                            <div className="text-xs text-white/40">
                                                {formData.sector}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* STEP 3: Quantity and Prices */}
                            <div>
                                <label className="block text-sm text-white/60 mb-3">
                                    <span className="text-white/90 font-medium">Step 3:</span> Enter Details
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs text-white/50 mb-2">
                                            Quantity <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="quantity"
                                            value={formData.quantity}
                                            onChange={handleChange}
                                            placeholder="100"
                                            min="1"
                                            step="1"
                                            className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${errors.quantity ? 'border-red-400/50' : 'border-white/10'
                                                } text-white placeholder:text-white/30 outline-none focus:border-white/20 transition-colors`}
                                            disabled={isSubmitting}
                                        />
                                        {errors.quantity && (
                                            <p className="text-red-400 text-xs mt-1">{errors.quantity}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs text-white/50 mb-2">
                                            Avg Buy Price (₹) <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="avgBuyPrice"
                                            value={formData.avgBuyPrice}
                                            onChange={handleChange}
                                            placeholder="1500"
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
                                        <label className="block text-xs text-white/50 mb-2">
                                            Current Price (₹) <span className="text-red-400">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="currentPrice"
                                                value={formData.currentPrice}
                                                onChange={handleChange}
                                                placeholder="1750"
                                                min="0.01"
                                                step="0.01"
                                                className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${errors.currentPrice ? 'border-red-400/50' : 'border-white/10'
                                                    } text-white placeholder:text-white/30 outline-none focus:border-white/20 transition-colors pr-10`}
                                                disabled={isSubmitting || isFetchingPrice}
                                            />
                                            {isFetchingPrice ? (
                                                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 animate-spin" />
                                            ) : (
                                                formData.symbol && (
                                                    <button
                                                        type="button"
                                                        onClick={() => fetchPrice(formData.symbol)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
                                                        title="Refresh Price"
                                                    >
                                                        <RefreshCw className="w-4 h-4 text-white/40 hover:text-white/80" />
                                                    </button>
                                                )
                                            )}
                                        </div>
                                        {errors.currentPrice && (
                                            <p className="text-red-400 text-xs mt-1">{errors.currentPrice}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Calculated Preview */}
                            {formData.quantity && formData.avgBuyPrice && formData.currentPrice && (
                                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                                    <h3 className="text-sm text-white/60 mb-3">Preview Calculations</h3>
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
                                            Add Share
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
