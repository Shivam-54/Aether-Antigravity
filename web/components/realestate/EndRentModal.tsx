'use client';

import { Property } from '@/types/realestate';
import { X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRealEstate } from '@/context/RealEstateContext';

interface EndRentModalProps {
    isOpen: boolean;
    onClose: () => void;
    property: Property;
}

export default function EndRentModal({ isOpen, onClose, property }: EndRentModalProps) {
    const { endRent } = useRealEstate();

    if (!isOpen) return null;

    const handleConfirm = () => {
        endRent(property.id);
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
                    className="w-full max-w-md bg-[#111] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
                >
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <h2 className="text-xl font-light text-white/90">End Rental</h2>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                            <X size={20} className="text-white/50" />
                        </button>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="flex items-start gap-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                            <AlertCircle className="text-red-400 shrink-0" size={24} />
                            <div>
                                <h3 className="text-sm font-medium text-red-400 mb-1">Stop Rental Income?</h3>
                                <p className="text-sm font-light text-white/60">
                                    This will revert <strong>{property.name}</strong> to "Owned" status.
                                    Rental income calculations will stop immediately.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 px-6 rounded-xl border border-white/10 text-white/70 hover:bg-white/5 transition-all text-sm font-light"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                className="flex-1 py-3 px-6 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl font-medium hover:bg-red-500/20 transition-all text-sm"
                            >
                                End Rent
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
