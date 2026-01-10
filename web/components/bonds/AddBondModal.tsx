'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import {
    fetchBondTypes,
    fetchIssuersByType,
    fetchBondsByIssuer,
    addUserBond
} from '@/lib/supabase/bonds';
import type { BondMaster } from '@/types/bonds';

interface AddBondModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: () => void; // Simplified - just refresh bonds after adding
}

export default function AddBondModal({ isOpen, onClose, onAdd }: AddBondModalProps) {
    // Step 1: Bond Type Selection
    const [bondTypes, setBondTypes] = useState<string[]>([]);
    const [selectedType, setSelectedType] = useState('');

    // Step 2: Issuer Selection
    const [issuers, setIssuers] = useState<string[]>([]);
    const [selectedIssuer, setSelectedIssuer] = useState('');

    // Step 3: Bond Selection
    const [bonds, setBonds] = useState<BondMaster[]>([]);
    const [selectedBond, setSelectedBond] = useState<BondMaster | null>(null);

    // Step 4: User Inputs
    const [formData, setFormData] = useState({
        quantity: '1',
        purchasePrice: '',
        purchaseDate: new Date().toISOString().split('T')[0],
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Fetch bond types on mount
    useEffect(() => {
        if (isOpen) {
            fetchBondTypes().then(types => setBondTypes(types));
        }
    }, [isOpen]);

    // Fetch issuers when type changes
    useEffect(() => {
        if (selectedType) {
            (async () => {
                const issuersList = await fetchIssuersByType(selectedType);
                setIssuers(issuersList);
                setSelectedIssuer('');
                setBonds([]);
                setSelectedBond(null);
            })();
        }
    }, [selectedType]);

    // Fetch bonds when issuer changes
    useEffect(() => {
        if (selectedIssuer) {
            (async () => {
                const bondsList = await fetchBondsByIssuer(selectedIssuer);
                setBonds(bondsList);
                setSelectedBond(null);
            })();
        }
    }, [selectedIssuer]);

    // Auto-populate purchase price from face value
    useEffect(() => {
        if (selectedBond && !formData.purchasePrice) {
            setFormData(prev => ({
                ...prev,
                purchasePrice: selectedBond.face_value?.toString() || ''
            }));
        }
    }, [selectedBond]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!selectedBond) newErrors.bond = 'Please select a bond';
        if (!formData.quantity || Number(formData.quantity) <= 0) {
            newErrors.quantity = 'Valid quantity is required';
        }
        if (!formData.purchasePrice || Number(formData.purchasePrice) <= 0) {
            newErrors.purchasePrice = 'Valid purchase price is required';
        }
        if (!formData.purchaseDate) newErrors.purchaseDate = 'Purchase date is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate() || !selectedBond) return;

        setIsSubmitting(true);

        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                throw new Error('User not authenticated');
            }

            const currentValue = Number(formData.purchasePrice) * Number(formData.quantity);

            const result = await addUserBond(
                user.id,
                selectedBond.id,
                Number(formData.quantity),
                Number(formData.purchasePrice),
                formData.purchaseDate,
                currentValue
            );

            if (result.success) {
                // Reset form
                setSelectedType('');
                setSelectedIssuer('');
                setSelectedBond(null);
                setFormData({
                    quantity: '1',
                    purchasePrice: '',
                    purchaseDate: new Date().toISOString().split('T')[0],
                });
                setErrors({});
                onAdd(); // Trigger refresh
                onClose();
            } else {
                setErrors({ submit: result.error || 'Failed to add bond' });
            }
        } catch (error) {
            console.error('Error adding bond:', error);
            setErrors({ submit: 'An error occurred while adding the bond' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setSelectedType('');
            setSelectedIssuer('');
            setSelectedBond(null);
            setFormData({
                quantity: '1',
                purchasePrice: '',
                purchaseDate: new Date().toISOString().split('T')[0],
            });
            setErrors({});
            onClose();
        }
    };

    // Calculate preview values
    const totalInvestment = formData.quantity && formData.purchasePrice
        ? Number(formData.quantity) * Number(formData.purchasePrice)
        : 0;

    const annualIncome = selectedBond && formData.quantity
        ? (selectedBond.face_value || 0) * Number(formData.quantity) * ((selectedBond.coupon_rate || 0) / 100)
        : 0;

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
                                <h2 className="text-2xl font-light text-white">Add New Bond</h2>
                                <p className="text-sm text-white/40 mt-1">Select from catalog and add to your portfolio</p>
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
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Step 1: Bond Type */}
                            <div>
                                <label className="block text-sm text-white/60 mb-2">
                                    Step 1: Select Bond Type <span className="text-red-400">*</span>
                                </label>
                                <select
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-white/20 transition-colors"
                                    disabled={isSubmitting}
                                >
                                    <option value="" className="bg-[#0a0a0a]">Choose bond category...</option>
                                    {bondTypes.map(type => (
                                        <option key={type} value={type} className="bg-[#0a0a0a] capitalize">
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Step 2: Issuer */}
                            {selectedType && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <label className="block text-sm text-white/60 mb-2">
                                        Step 2: Select Issuer <span className="text-red-400">*</span>
                                    </label>
                                    <select
                                        value={selectedIssuer}
                                        onChange={(e) => setSelectedIssuer(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-white/20 transition-colors"
                                        disabled={isSubmitting}
                                    >
                                        <option value="" className="bg-[#0a0a0a]">Choose issuer...</option>
                                        {issuers.map(issuer => (
                                            <option key={issuer} value={issuer} className="bg-[#0a0a0a]">
                                                {issuer}
                                            </option>
                                        ))}
                                    </select>
                                </motion.div>
                            )}

                            {/* Step 3: Specific Bond */}
                            {selectedIssuer && bonds.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <label className="block text-sm text-white/60 mb-2">
                                        Step 3: Select Bond <span className="text-red-400">*</span>
                                    </label>
                                    <div className="space-y-2">
                                        {bonds.map((bond) => (
                                            <button
                                                key={bond.id}
                                                type="button"
                                                onClick={() => setSelectedBond(bond)}
                                                className={`w-full p-4 rounded-xl border transition-all text-left ${selectedBond?.id === bond.id
                                                    ? 'bg-white/10 border-white/20'
                                                    : 'bg-white/[0.02] border-white/5 hover:bg-white/5'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="text-white font-medium">{bond.bond_name}</p>
                                                        <p className="text-white/40 text-xs mt-1">{bond.bond_series}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-green-400 text-sm">{bond.coupon_rate}%</p>
                                                        <p className="text-white/30 text-xs">{bond.rating}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4 mt-2 text-xs text-white/40">
                                                    <span>Face: ₹{bond.face_value?.toLocaleString()}</span>
                                                    <span>Maturity: {bond.maturity_date}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    {errors.bond && (
                                        <p className="text-red-400 text-xs mt-1">{errors.bond}</p>
                                    )}
                                </motion.div>
                            )}

                            {/* Step 4: User Inputs */}
                            {selectedBond && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-4 pt-2"
                                >
                                    <h3 className="text-sm text-white/60">Step 4: Purchase Details</h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-white/60 mb-2">
                                                Quantity <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                name="quantity"
                                                value={formData.quantity}
                                                onChange={handleChange}
                                                min="1"
                                                step="1"
                                                className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${errors.quantity ? 'border-red-400/50' : 'border-white/10'
                                                    } text-white outline-none focus:border-white/20 transition-colors`}
                                                disabled={isSubmitting}
                                            />
                                            {errors.quantity && (
                                                <p className="text-red-400 text-xs mt-1">{errors.quantity}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm text-white/60 mb-2">
                                                Purchase Price (₹) <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                name="purchasePrice"
                                                value={formData.purchasePrice}
                                                onChange={handleChange}
                                                min="0"
                                                step="10"
                                                placeholder={selectedBond.face_value?.toString()}
                                                className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${errors.purchasePrice ? 'border-red-400/50' : 'border-white/10'
                                                    } text-white placeholder:text-white/30 outline-none focus:border-white/20 transition-colors`}
                                                disabled={isSubmitting}
                                            />
                                            {errors.purchasePrice && (
                                                <p className="text-red-400 text-xs mt-1">{errors.purchasePrice}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-white/60 mb-2">
                                            Purchase Date <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            name="purchaseDate"
                                            value={formData.purchaseDate}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-white/20 transition-colors"
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    {/* Preview Summary */}
                                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                                        <h4 className="text-sm text-white/60 mb-3">Purchase Summary</h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <div className="text-white/40 text-xs mb-1">Total Investment</div>
                                                <div className="text-white font-medium">
                                                    ₹{totalInvestment.toLocaleString()}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-white/40 text-xs mb-1">Annual Income</div>
                                                <div className="text-green-400 font-medium">
                                                    ₹{annualIncome.toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Error Message */}
                            {errors.submit && (
                                <div className="p-4 rounded-xl bg-red-400/10 border border-red-400/20">
                                    <p className="text-red-400 text-sm">{errors.submit}</p>
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
                                    disabled={isSubmitting || !selectedBond}
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
                                            Add Bond
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
