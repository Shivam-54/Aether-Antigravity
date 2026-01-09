'use client';

import { Property, PropertyStatus } from '@/types/realestate';
import { X, Home, MapPin, Calendar, Users, IndianRupee, TrendingUp, Percent, ArrowRight, Key, LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RentPropertyModal from './RentPropertyModal';
import SellPropertyModal from './SellPropertyModal';
import EndRentModal from './EndRentModal';
import { useState } from 'react';

interface PropertyDetailsProps {
    property: Property | null;
    onClose: () => void;
}

export default function PropertyDetails({ property, onClose }: PropertyDetailsProps) {
    const [activeModal, setActiveModal] = useState<'rent' | 'sell' | 'endRent' | null>(null);

    if (!property) return null;

    return (
        <AnimatePresence>
            {property && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ type: 'spring', duration: 0.3 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl p-8"
                        style={{
                            background: 'rgba(10, 10, 10, 0.95)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: '0 0 80px 0 rgba(255, 255, 255, 0.1), inset 0 0 20px 0 rgba(255, 255, 255, 0.02)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                        }}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 transition-colors duration-200"
                        >
                            <X size={20} strokeWidth={1.5} className="text-white/60" />
                        </button>

                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center gap-2 mb-2">
                                <h2 className="text-3xl font-light tracking-wide text-white/90">
                                    {property.name}
                                </h2>
                                <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-white/70 font-light tracking-wider">
                                    {property.propertyType}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-white/50">
                                <MapPin size={16} strokeWidth={1.5} />
                                <span className="text-sm font-light tracking-wide">
                                    {property.location}
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            {property.status === PropertyStatus.Owned && (
                                <>
                                    <button
                                        onClick={() => setActiveModal('rent')}
                                        className="py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/90 font-light flex items-center justify-center gap-2 transition-all"
                                    >
                                        <Key size={16} /> Rent Property
                                    </button>
                                    <button
                                        onClick={() => setActiveModal('sell')}
                                        className="py-3 px-4 bg-white text-black hover:bg-white/90 rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
                                    >
                                        Sell Property <ArrowRight size={16} />
                                    </button>
                                </>
                            )}

                            {property.status === PropertyStatus.Rented && (
                                <>
                                    <button
                                        onClick={() => setActiveModal('endRent')}
                                        className="py-3 px-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl font-light flex items-center justify-center gap-2 transition-all"
                                    >
                                        End Rental
                                    </button>
                                    <button
                                        onClick={() => setActiveModal('sell')}
                                        className="py-3 px-4 bg-white text-black hover:bg-white/90 rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
                                    >
                                        Sell Property <ArrowRight size={16} />
                                    </button>
                                </>
                            )}

                            {property.status === PropertyStatus.Sold && (
                                <div className="col-span-2 py-3 px-4 bg-white/5 border border-white/5 rounded-xl text-white/40 text-center font-light text-sm italic">
                                    Property Sold - Read Only View
                                </div>
                            )}
                        </div>

                        <div className="space-y-8">
                            {/* Property Specifications */}
                            <div>
                                <h3 className="text-sm font-light tracking-widest uppercase text-white/40 mb-4">
                                    Property Specifications
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <SpecCard
                                        icon={Home}
                                        label="Land Area"
                                        value={`${property.landArea} ${property.landUnit}`}
                                    />
                                    {property.bedrooms !== undefined && (
                                        <SpecCard
                                            icon={Home}
                                            label="Bedrooms"
                                            value={property.bedrooms.toString()}
                                        />
                                    )}
                                    {property.bathrooms !== undefined && (
                                        <SpecCard
                                            icon={Home}
                                            label="Bathrooms"
                                            value={property.bathrooms.toString()}
                                        />
                                    )}
                                    <SpecCard
                                        icon={Home}
                                        label="Type"
                                        value={property.propertyType}
                                    />
                                </div>
                            </div>

                            {/* Financial Breakdown */}
                            <div>
                                <h3 className="text-sm font-light tracking-widest uppercase text-white/40 mb-4">
                                    Financial Breakdown
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FinancialCard
                                        icon={IndianRupee}
                                        label="Current Market Value"
                                        value={`₹${(property.currentValue / 10000000).toFixed(2)} Cr`}
                                        subtext="Current valuation"
                                    />
                                    <FinancialCard
                                        icon={IndianRupee}
                                        label="Outstanding Mortgage"
                                        value={`₹${(property.outstandingMortgage / 10000000).toFixed(2)} Cr`}
                                        subtext={property.outstandingMortgage === 0 ? 'Fully owned' : 'Remaining debt'}
                                    />
                                    <FinancialCard
                                        icon={TrendingUp}
                                        label="Equity"
                                        value={`₹${(property.equity / 10000000).toFixed(2)} Cr`}
                                        subtext="Your ownership value"
                                    />
                                    <FinancialCard
                                        icon={Percent}
                                        label="Loan-to-Value Ratio"
                                        value={`${property.loanToValue.toFixed(1)}%`}
                                        subtext={property.loanToValue < 30 ? 'Low risk' : 'Moderate risk'}
                                    />
                                </div>
                            </div>

                            {/* Ownership Metadata */}
                            <div>
                                <h3 className="text-sm font-light tracking-widest uppercase text-white/40 mb-4">
                                    Ownership Metadata
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <MetadataCard
                                        icon={Calendar}
                                        label="Acquisition Date"
                                        value={new Date(property.acquisitionDate).toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    />
                                    <MetadataCard
                                        icon={Calendar}
                                        label="Holding Duration"
                                        value={property.holdingDuration}
                                    />
                                    <MetadataCard
                                        icon={Users}
                                        label="Ownership Structure"
                                        value={property.ownershipStructure}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Modals */}
            {property && (
                <>
                    <RentPropertyModal
                        isOpen={activeModal === 'rent'}
                        onClose={() => setActiveModal(null)}
                        property={property}
                    />
                    <SellPropertyModal
                        isOpen={activeModal === 'sell'}
                        onClose={() => setActiveModal(null)}
                        property={property}
                    />
                    <EndRentModal
                        isOpen={activeModal === 'endRent'}
                        onClose={() => setActiveModal(null)}
                        property={property}
                    />
                </>
            )}
        </AnimatePresence>
    );
}

function SpecCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
    return (
        <div
            className="p-4 rounded-xl"
            style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
        >
            <Icon size={16} strokeWidth={1.5} className="text-white/40 mb-2" />
            <p className="text-xs font-light tracking-wide text-white/40 mb-1">{label}</p>
            <p className="text-sm font-light text-white/90">{value}</p>
        </div>
    );
}

function FinancialCard({ icon: Icon, label, value, subtext }: { icon: LucideIcon; label: string; value: string; subtext: string }) {
    return (
        <div
            className="p-5 rounded-xl"
            style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
        >
            <Icon size={18} strokeWidth={1.5} className="text-white/50 mb-3" />
            <p className="text-xs font-light tracking-wide text-white/40 mb-2">{label}</p>
            <p className="text-xl font-light text-white/90 mb-1">{value}</p>
            <p className="text-xs font-light text-white/40">{subtext}</p>
        </div>
    );
}

function MetadataCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
    return (
        <div
            className="p-5 rounded-xl"
            style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
        >
            <Icon size={16} strokeWidth={1.5} className="text-white/40 mb-3" />
            <p className="text-xs font-light tracking-wide text-white/40 mb-2">{label}</p>
            <p className="text-sm font-light text-white/90">{value}</p>
        </div>
    );
}
