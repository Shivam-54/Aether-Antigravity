'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { PropertyType } from '@/types/realestate';

interface AddPropertyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (propertyData: PropertyFormData) => void;
}

export interface PropertyFormData {
    name: string;
    propertyType: PropertyType;
    address: string;
    purchasePrice: number;
    currentPrice: number;
    longitude: number;
    latitude: number;
}

export default function AddPropertyModal({ isOpen, onClose, onSubmit }: AddPropertyModalProps) {
    const [formData, setFormData] = useState<PropertyFormData>({
        name: '',
        propertyType: 'Residential',
        address: '',
        purchasePrice: 0,
        currentPrice: 0,
        longitude: 0,
        latitude: 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!formData.name || !formData.address || formData.purchasePrice <= 0 || formData.currentPrice <= 0) {
            alert('Please fill in all required fields with valid values');
            return;
        }

        onSubmit(formData);

        // Reset form
        setFormData({
            name: '',
            propertyType: 'Residential',
            address: '',
            purchasePrice: 0,
            currentPrice: 0,
            longitude: 0,
            latitude: 0,
        });

        onClose();
    };

    const handleChange = (field: keyof PropertyFormData, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-8"
                            style={{
                                background: 'rgba(20, 20, 20, 0.95)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                boxShadow: '0 0 60px 0 rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(20px)',
                                WebkitBackdropFilter: 'blur(20px)',
                            }}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-2xl font-light tracking-wider text-white/90">
                                        Add New Property
                                    </h2>
                                    <p className="text-sm font-light tracking-wide text-white/50 mt-1">
                                        Enter property details to add to your portfolio
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full hover:bg-white/5 transition-colors"
                                >
                                    <X size={24} className="text-white/60" strokeWidth={1.5} />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Property Name */}
                                <div>
                                    <label className="block text-xs font-light tracking-widest uppercase text-white/60 mb-2">
                                        Property Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        placeholder="e.g., Sunset Villa"
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/90 placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors font-light"
                                        required
                                    />
                                </div>

                                {/* Property Type */}
                                <div>
                                    <label className="block text-xs font-light tracking-widest uppercase text-white/60 mb-2">
                                        Type of Property *
                                    </label>
                                    <select
                                        value={formData.propertyType}
                                        onChange={(e) => handleChange('propertyType', e.target.value as PropertyType)}
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/90 focus:outline-none focus:border-white/20 transition-colors font-light"
                                        required
                                    >
                                        <option value="Residential">Residential</option>
                                        <option value="Commercial">Commercial</option>
                                        <option value="Land">Land</option>
                                    </select>
                                </div>

                                {/* Address */}
                                <div>
                                    <label className="block text-xs font-light tracking-widest uppercase text-white/60 mb-2">
                                        Address *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => handleChange('address', e.target.value)}
                                        placeholder="e.g., Mumbai, Maharashtra"
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/90 placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors font-light"
                                        required
                                    />
                                </div>

                                {/* Purchase and Current Price */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-light tracking-widest uppercase text-white/60 mb-2">
                                            Purchase Price (₹) *
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.purchasePrice || ''}
                                            onChange={(e) => handleChange('purchasePrice', parseFloat(e.target.value) || 0)}
                                            placeholder="e.g., 5000000"
                                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/90 placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors font-light"
                                            required
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-light tracking-widest uppercase text-white/60 mb-2">
                                            Current Price (₹) *
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.currentPrice || ''}
                                            onChange={(e) => handleChange('currentPrice', parseFloat(e.target.value) || 0)}
                                            placeholder="e.g., 6000000"
                                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/90 placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors font-light"
                                            required
                                            min="0"
                                        />
                                    </div>
                                </div>

                                {/* Longitude and Latitude */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-light tracking-widest uppercase text-white/60 mb-2">
                                            Longitude
                                        </label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={formData.longitude || ''}
                                            onChange={(e) => handleChange('longitude', parseFloat(e.target.value) || 0)}
                                            placeholder="e.g., 72.8777"
                                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/90 placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors font-light"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-light tracking-widest uppercase text-white/60 mb-2">
                                            Latitude
                                        </label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={formData.latitude || ''}
                                            onChange={(e) => handleChange('latitude', parseFloat(e.target.value) || 0)}
                                            placeholder="e.g., 19.0760"
                                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/90 placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors font-light"
                                        />
                                    </div>
                                </div>

                                {/* Submit Buttons */}
                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white/90 hover:bg-white/10 transition-all duration-200 font-light tracking-wide"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white/90 hover:bg-white/15 transition-all duration-200 font-light tracking-wide"
                                    >
                                        Add Property
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
