'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Share, HoldingDuration } from '@/types/shares';

interface AddShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (share: Share) => Promise<void>;
}

export default function AddShareModal({ isOpen, onClose, onAdd }: AddShareModalProps) {
    const [formData, setFormData] = useState({
        symbol: '',
        companyName: '',
        sector: '',
        quantity: '',
        avgBuyPrice: '',
        currentPrice: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const sectors = [
        'Technology',
        'Financial Services',
        'Healthcare',
        'Consumer Goods',
        'Energy',
        'Telecommunications',
        'Industrials',
        'Utilities',
        'Real Estate',
        'Materials',
        'Broad Market'
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.symbol.trim()) newErrors.symbol = 'Symbol is required';
        if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
        if (!formData.sector) newErrors.sector = 'Sector is required';
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

            // Calculate holding duration based on acquisition date (default to today for new shares)
            const acquisitionDate = new Date().toISOString();
            const holdingDuration: HoldingDuration = 'Short'; // New shares start as Short

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
                holdingDuration
            };

            await onAdd(newShare);

            // Reset form
            setFormData({
                symbol: '',
                companyName: '',
                sector: '',
                quantity: '',
                avgBuyPrice: '',
                currentPrice: '',
            });
            setErrors({});
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
                symbol: '',
                companyName: '',
                sector: '',
                quantity: '',
                avgBuyPrice: '',
                currentPrice: '',
            });
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
                                <h2 className="text-2xl font-light text-white">Add New Share</h2>
                                <p className="text-sm text-white/40 mt-1">Enter share details to add to your portfolio</p>
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
                            {/* Symbol and Company Name */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-white/60 mb-2">
                                        Stock Symbol <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="symbol"
                                        value={formData.symbol}
                                        onChange={handleChange}
                                        placeholder="AAPL, TSLA, etc."
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
                                        Company Name <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        placeholder="Apple Inc."
                                        className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${errors.companyName ? 'border-red-400/50' : 'border-white/10'
                                            } text-white placeholder:text-white/30 outline-none focus:border-white/20 transition-colors`}
                                        disabled={isSubmitting}
                                    />
                                    {errors.companyName && (
                                        <p className="text-red-400 text-xs mt-1">{errors.companyName}</p>
                                    )}
                                </div>
                            </div>

                            {/* Sector */}
                            <div>
                                <label className="block text-sm text-white/60 mb-2">
                                    Sector <span className="text-red-400">*</span>
                                </label>
                                <select
                                    name="sector"
                                    value={formData.sector}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${errors.sector ? 'border-red-400/50' : 'border-white/10'
                                        } text-white outline-none focus:border-white/20 transition-colors`}
                                    disabled={isSubmitting}
                                >
                                    <option value="" className="bg-[#0a0a0a]">Select sector...</option>
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
                                    <label className="block text-sm text-white/60 mb-2">
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
                                    <label className="block text-sm text-white/60 mb-2">
                                        Current Price (₹) <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="currentPrice"
                                        value={formData.currentPrice}
                                        onChange={handleChange}
                                        placeholder="1750"
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
