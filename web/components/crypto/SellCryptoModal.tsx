'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CryptoAsset } from '@/context/CryptoContext';

interface SellCryptoModalProps {
    isOpen: boolean;
    onClose: () => void;
    asset: CryptoAsset;
    onSell: (cryptoId: string, sellPrice: number, quantity: number) => Promise<void>;
}

export default function SellCryptoModal({ isOpen, onClose, asset, onSell }: SellCryptoModalProps) {
    const [quantity, setQuantity] = useState('');
    const [sellPrice, setSellPrice] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ quantity?: string; sellPrice?: string }>({});

    useEffect(() => {
        if (isOpen) {
            setSellPrice(asset.current_price.toString());
        }
    }, [isOpen, asset.current_price]);

    const totalValue = quantity && sellPrice
        ? Number(quantity) * Number(sellPrice)
        : 0;

    const gain = quantity && sellPrice
        ? (Number(quantity) * Number(sellPrice)) - (Number(quantity) * asset.purchase_price_avg)
        : 0;

    const gainPercent = quantity && sellPrice
        ? ((Number(sellPrice) - asset.purchase_price_avg) / asset.purchase_price_avg) * 100
        : 0;

    const validate = () => {
        const newErrors: { quantity?: string; sellPrice?: string } = {};

        if (!quantity || Number(quantity) <= 0) {
            newErrors.quantity = 'Valid quantity is required';
        } else if (Number(quantity) > asset.quantity) {
            newErrors.quantity = `Maximum ${asset.quantity} ${asset.symbol} available`;
        }

        if (!sellPrice || Number(sellPrice) <= 0) {
            newErrors.sellPrice = 'Valid sell price is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setIsSubmitting(true);
        try {
            await onSell(asset.id, Number(sellPrice), Number(quantity));
            handleClose();
        } catch (error) {
            console.error('Error selling crypto:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setQuantity('');
            setSellPrice(asset.current_price.toString());
            setErrors({});
            onClose();
        }
    };

    const handleMaxClick = () => {
        setQuantity(asset.quantity.toString());
        if (errors.quantity) {
            setErrors(prev => ({ ...prev, quantity: '' }));
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
                                <h2 className="text-2xl font-light text-white">Sell {asset.name}</h2>
                                <p className="text-sm text-white/40 mt-1">Enter details to sell your {asset.symbol}</p>
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
                            {/* Balance and Price Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-white/60 mb-2">
                                        Available Balance
                                    </label>
                                    <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                                        <div className="text-white font-medium">
                                            {asset.quantity} {asset.symbol}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-white/60 mb-2">
                                        Avg. Purchase Price
                                    </label>
                                    <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                                        <div className="text-white font-medium">
                                            ₹{asset.purchase_price_avg.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quantity to Sell */}
                            <div>
                                <label className="block text-sm text-white/60 mb-2">
                                    Quantity to Sell <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => {
                                            setQuantity(e.target.value);
                                            if (errors.quantity) setErrors(prev => ({ ...prev, quantity: '' }));
                                        }}
                                        placeholder={`0.00 ${asset.symbol}`}
                                        min="0.00000001"
                                        step="any"
                                        className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${errors.quantity ? 'border-red-400/50' : 'border-white/10'
                                            } text-white placeholder:text-white/30 outline-none focus:border-white/20 transition-colors pr-16`}
                                        disabled={isSubmitting}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleMaxClick}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-purple-500/10 text-purple-400 text-sm hover:bg-purple-500/20 transition-colors"
                                        disabled={isSubmitting}
                                    >
                                        MAX
                                    </button>
                                </div>
                                {errors.quantity && (
                                    <p className="text-red-400 text-xs mt-1">{errors.quantity}</p>
                                )}
                            </div>

                            {/* Sell Price */}
                            <div>
                                <label className="block text-sm text-white/60 mb-2">
                                    Sell Price per {asset.symbol} <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">₹</span>
                                    <input
                                        type="number"
                                        value={sellPrice}
                                        onChange={(e) => {
                                            setSellPrice(e.target.value);
                                            if (errors.sellPrice) setErrors(prev => ({ ...prev, sellPrice: '' }));
                                        }}
                                        placeholder="0"
                                        min="0.01"
                                        step="0.01"
                                        className={`w-full px-4 py-3 pl-8 rounded-xl bg-white/5 border ${errors.sellPrice ? 'border-red-400/50' : 'border-white/10'
                                            } text-white placeholder:text-white/30 outline-none focus:border-white/20 transition-colors`}
                                        disabled={isSubmitting}
                                    />
                                </div>
                                {errors.sellPrice && (
                                    <p className="text-red-400 text-xs mt-1">{errors.sellPrice}</p>
                                )}
                            </div>

                            {/* Calculated Preview */}
                            {quantity && sellPrice && (
                                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                                    <h3 className="text-sm text-white/60 mb-3">Transaction Summary</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <div className="text-white/40 text-xs mb-1">Total Value</div>
                                            <div className="text-white font-medium">
                                                ₹{totalValue.toLocaleString()}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-white/40 text-xs mb-1">Gain/Loss</div>
                                            <div className={`font-medium ${gain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {gain >= 0 ? '+' : ''}₹{gain.toLocaleString()}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-white/40 text-xs mb-1">Return %</div>
                                            <div className={`font-medium ${gainPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(2)}%
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
                                            Selling...
                                        </>
                                    ) : (
                                        `Sell ${asset.symbol}`
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
