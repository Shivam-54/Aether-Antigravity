'use client';

import { useState } from 'react';
import { Property, SaleInfo } from '@/types/realestate';
import { X, Sparkles, ArrowRight, IndianRupee, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRealEstate } from '@/context/RealEstateContext';

interface SellPropertyModalProps {
    isOpen: boolean;
    onClose: () => void;
    property: Property;
}

export default function SellPropertyModal({ isOpen, onClose, property }: SellPropertyModalProps) {
    const { sellProperty } = useRealEstate();
    const [step, setStep] = useState<1 | 2>(1);

    const [formData, setFormData] = useState<SaleInfo>({
        sellingPrice: property.currentValue, // Default to current valuation
        saleDate: new Date().toISOString().split('T')[0],
        paymentMode: 'Cash',
        buyerType: 'Individual',
        capitalGain: 0,
        appreciationPercent: 0
    });

    if (!isOpen) return null;

    const calculateMetrics = () => {
        const gain = formData.sellingPrice - property.purchaseValue;
        const percent = (gain / property.purchaseValue) * 100;
        return { gain, percent };
    };

    const handleConfirm = () => {
        const metrics = calculateMetrics();
        sellProperty(property.id, {
            ...formData,
            capitalGain: metrics.gain,
            appreciationPercent: metrics.percent
        });
        onClose();
    };

    const metrics = calculateMetrics();

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="w-full max-w-2xl bg-[#111] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-light text-white/90">Sell Property</h2>
                            <p className="text-sm font-light text-white/50">{property.name}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                            <X size={20} className="text-white/50" />
                        </button>
                    </div>

                    <div className="p-8">
                        {step === 1 ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-light tracking-wider text-white/40 uppercase">Selling Price</label>
                                        <div className="relative group">
                                            <IndianRupee size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-white/60 transition-colors" />
                                            <input
                                                type="number"
                                                value={formData.sellingPrice || ''}
                                                onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white/90 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all font-light"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-light tracking-wider text-white/40 uppercase">Sale Date</label>
                                        <div className="relative group">
                                            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-white/60 transition-colors" />
                                            <input
                                                type="date"
                                                value={formData.saleDate}
                                                onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white/90 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all font-light"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-light tracking-wider text-white/40 uppercase">Payment Mode</label>
                                        <div className="grid grid-cols-3 gap-2 p-1 bg-white/5 rounded-xl">
                                            {['Cash', 'Loan', 'Mixed'].map((mode) => (
                                                <button
                                                    key={mode}
                                                    onClick={() => setFormData({ ...formData, paymentMode: mode as SaleInfo['paymentMode'] })}
                                                    className={`py-2 text-sm rounded-lg transition-all ${formData.paymentMode === mode
                                                        ? 'bg-white/10 text-white shadow-lg'
                                                        : 'text-white/40 hover:text-white/70'
                                                        }`}
                                                >
                                                    {mode}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-light tracking-wider text-white/40 uppercase">Buyer Type (Optional)</label>
                                        <input
                                            type="text"
                                            value={formData.buyerType || ''}
                                            onChange={(e) => setFormData({ ...formData, buyerType: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white/90 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all font-light"
                                            placeholder="Individual, Entity, etc."
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={() => setStep(2)}
                                    disabled={!formData.sellingPrice}
                                    className="w-full py-4 mt-4 bg-white text-black rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                >
                                    Analyze Sale Impact <Sparkles size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* AI Insight Box */}
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-amber-500/5 backdrop-blur-[2px]" />
                                    <div className="relative z-10">
                                        <div className="flex items-start gap-3 mb-4">
                                            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                                                <TrendingUp size={18} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-light text-white/90 mb-1">Sale Impact Analysis</h3>
                                                <p className="text-sm font-light text-white/60">
                                                    Selling this asset realizes a capital gain of ₹{(metrics.gain / 100000).toFixed(2)}L
                                                    and reduces geographic concentration in {property.state}.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
                                            <div>
                                                <div className="text-xs font-light uppercase tracking-wider text-white/40 mb-1">Capital Gain</div>
                                                <div className={`text-xl font-light ${metrics.gain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {metrics.gain >= 0 ? '+' : ''}₹{(metrics.gain / 100000).toFixed(2)}L
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs font-light uppercase tracking-wider text-white/40 mb-1">Appreciation</div>
                                                <div className={`text-xl font-light ${metrics.percent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {metrics.percent.toFixed(1)}%
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs font-light uppercase tracking-wider text-white/40 mb-1">Liquidity Event</div>
                                                <div className="text-xl font-light text-white/90">
                                                    ₹{(formData.sellingPrice / 100000).toFixed(2)}L
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex gap-3 items-center">
                                    <AlertTriangle className="text-white/40" size={20} />
                                    <p className="text-sm font-light text-white/60">
                                        This action is irreversible. The property will be moved to &quot;Sold&quot; status and become read-only.
                                    </p>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="flex-1 py-3 px-6 rounded-xl border border-white/10 text-white/70 hover:bg-white/5 transition-all text-sm font-light"
                                    >
                                        Back to Edit
                                    </button>
                                    <button
                                        onClick={handleConfirm}
                                        className="flex-[2] py-3 px-6 bg-white text-black rounded-xl font-medium hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                    >
                                        Confirm Sale <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
