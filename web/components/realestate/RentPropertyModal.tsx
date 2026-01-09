'use client';

import { useState } from 'react';
import { Property, RentalInfo } from '@/types/realestate';
import { X, Sparkles, ArrowRight, IndianRupee, Calendar, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRealEstate } from '@/context/RealEstateContext';

interface RentPropertyModalProps {
    isOpen: boolean;
    onClose: () => void;
    property: Property;
}

export default function RentPropertyModal({ isOpen, onClose, property }: RentPropertyModalProps) {
    const { rentProperty } = useRealEstate();
    const [step, setStep] = useState<1 | 2>(1);

    const [formData, setFormData] = useState<RentalInfo>({
        rentType: 'Monthly',
        rentAmount: 0,
        startDate: new Date().toISOString().split('T')[0],
        tenantType: 'Individual',
        securityDeposit: 0
    });

    if (!isOpen) return null;

    const calculateYield = () => {
        const annualRent = formData.rentType === 'Monthly'
            ? formData.rentAmount * 12
            : formData.rentAmount;
        return ((annualRent / property.currentValue) * 100).toFixed(2);
    };

    const handleConfirm = () => {
        rentProperty(property.id, formData);
        onClose();
    };

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
                            <h2 className="text-xl font-light text-white/90">Rent Property</h2>
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
                                        <label className="text-xs font-light tracking-wider text-white/40 uppercase">Rent Type</label>
                                        <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-xl">
                                            {['Monthly', 'Yearly'].map((type) => (
                                                <button
                                                    key={type}
                                                    onClick={() => setFormData({ ...formData, rentType: type as RentalInfo['rentType'] })}
                                                    className={`py-2 text-sm rounded-lg transition-all ${formData.rentType === type
                                                        ? 'bg-white/10 text-white shadow-lg'
                                                        : 'text-white/40 hover:text-white/70'
                                                        }`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-light tracking-wider text-white/40 uppercase">Rent Amount</label>
                                        <div className="relative group">
                                            <IndianRupee size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-white/60 transition-colors" />
                                            <input
                                                type="number"
                                                value={formData.rentAmount || ''}
                                                onChange={(e) => setFormData({ ...formData, rentAmount: Number(e.target.value) })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white/90 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all font-light"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-light tracking-wider text-white/40 uppercase">Start Date</label>
                                        <div className="relative group">
                                            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-white/60 transition-colors" />
                                            <input
                                                type="date"
                                                value={formData.startDate}
                                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white/90 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all font-light"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-light tracking-wider text-white/40 uppercase">Security Deposit</label>
                                        <div className="relative group">
                                            <Shield size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-white/60 transition-colors" />
                                            <input
                                                type="number"
                                                value={formData.securityDeposit || ''}
                                                onChange={(e) => setFormData({ ...formData, securityDeposit: Number(e.target.value) })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white/90 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all font-light"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setStep(2)}
                                    disabled={!formData.rentAmount}
                                    className="w-full py-4 mt-4 bg-white text-black rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                >
                                    Analyze Impact <Sparkles size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* AI Insight Box */}
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-blue-500/5 backdrop-blur-[2px]" />
                                    <div className="relative z-10">
                                        <div className="flex items-start gap-3 mb-4">
                                            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                                                <Sparkles size={18} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-light text-white/90 mb-1">Portfolio Impact Analysis</h3>
                                                <p className="text-sm font-light text-white/60">
                                                    This rent increases annual cash flow by ₹{((formData.rentType === 'Monthly' ? formData.rentAmount * 12 : formData.rentAmount) / 100000).toFixed(2)}L
                                                    and improves real estate yield.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
                                            <div>
                                                <div className="text-xs font-light uppercase tracking-wider text-white/40 mb-1">Rental Yield</div>
                                                <div className="text-xl font-light text-green-400">{calculateYield()}%</div>
                                            </div>
                                            <div>
                                                <div className="text-xs font-light uppercase tracking-wider text-white/40 mb-1">Annual Income</div>
                                                <div className="text-xl font-light text-white/90">
                                                    ₹{((formData.rentType === 'Monthly' ? formData.rentAmount * 12 : formData.rentAmount) / 100000).toFixed(2)}L
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs font-light uppercase tracking-wider text-white/40 mb-1">Monthly Cashflow</div>
                                                <div className="text-xl font-light text-white/90">
                                                    ₹{(formData.rentType === 'Monthly' ? formData.rentAmount : formData.rentAmount / 12).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
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
                                        Confirm Access & Activate <ArrowRight size={16} />
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
