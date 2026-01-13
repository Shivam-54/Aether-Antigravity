'use client';

import { useState } from 'react';
import { Property, PropertyStatus } from '@/types/realestate';
import { MapPin, TrendingUp, Eye, Plus } from 'lucide-react';
import PropertyDetails from './PropertyDetails';
import AddPropertyModal, { PropertyFormData } from './AddPropertyModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useRealEstate } from '@/context/RealEstateContext';

interface PropertiesListProps {
    // No longer needed as we use context
}

export default function PropertiesList({ }: PropertiesListProps) {
    const { properties, addProperty, loading } = useRealEstate();
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const handleAddProperty = async (formData: PropertyFormData) => {
        // Calculate appreciation percentage
        const appreciation = ((formData.currentPrice - formData.purchasePrice) / formData.purchasePrice) * 100;

        // Create new property object
        const newProperty: Property = {
            id: `property-${Date.now()}`, // Temporary ID, will be replaced by DB
            name: formData.name,
            location: formData.address,
            streetAddress: formData.address,
            city: formData.address.split(',')[0]?.trim() || '',
            state: formData.address.split(',')[1]?.trim() || '',
            zipCode: '000000',
            latitude: formData.latitude || 0,
            longitude: formData.longitude || 0,
            propertyType: formData.propertyType,
            purchaseValue: formData.purchasePrice,
            currentValue: formData.currentPrice,
            appreciation: appreciation,
            equity: formData.currentPrice, // Assuming no mortgage initially
            outstandingMortgage: 0,
            loanToValue: 0,
            landArea: 0, // Default value
            landUnit: 'sq ft',
            acquisitionDate: new Date().toISOString().split('T')[0],
            ownershipStructure: 'Individual',
            holdingDuration: '0 months',
            status: PropertyStatus.Owned
        };

        // Add to shared context
        await addProperty(newProperty);
        setIsAddModalOpen(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/50"></div>
            </div>
        );
    }

    // Filter to show only owned properties (hide rented and sold)
    const ownedProperties = properties.filter(p => p.status === PropertyStatus.Owned);

    return (
        <>
            <div className="space-y-6">
                <div className="flex items-center justify-between">

                    <div>
                        <h2 className="text-2xl font-light tracking-wider text-white/90 mb-2">
                            Active Properties
                        </h2>
                        <p className="text-sm font-light tracking-wide text-white/50">
                            {ownedProperties.length} {ownedProperties.length === 1 ? 'property' : 'properties'} currently owned
                        </p>
                    </div>

                    {/* Add Property Button */}
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white/90 hover:bg-white/15 hover:scale-105 transition-all duration-200 font-light tracking-wide"
                    >
                        <Plus size={18} strokeWidth={1.5} />
                        Add Property
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ownedProperties.map((property) => (
                        <div
                            key={property.id}
                            className="relative p-6 rounded-2xl overflow-hidden group transition-all duration-300 hover:scale-[1.02]"
                            style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                boxShadow: '0 0 30px 0 rgba(255, 255, 255, 0.05)',
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)',
                            }}
                        >
                            {/* Hover Texture */}
                            <div
                                className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out z-0 mix-blend-overlay"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                                    opacity: 0.06
                                }}
                            />

                            <div className="relative z-10 flex flex-col gap-4">
                                {/* Header */}
                                <div>
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="text-lg font-light tracking-wide text-white/90">
                                            {property.name}
                                        </h3>
                                        <div className="flex gap-2">
                                            {property.status === 'rented' && (
                                                <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400 font-light tracking-wider border border-green-500/20">
                                                    Rented
                                                </span>
                                            )}
                                            {property.status === 'sold' && (
                                                <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-white/40 font-light tracking-wider border border-white/10">
                                                    Sold
                                                </span>
                                            )}
                                            <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-white/60 font-light tracking-wider">
                                                {property.propertyType}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Full Address */}
                                    <div className="space-y-1.5 mb-3">
                                        <div className="flex items-start gap-1.5 text-white/50">
                                            <MapPin size={14} strokeWidth={1.5} className="mt-0.5 flex-shrink-0" />
                                            <div className="text-xs font-light tracking-wide">
                                                <p className="text-white/70">{property.streetAddress}</p>
                                                <p>{property.city}, {property.state} - {property.zipCode}</p>
                                            </div>
                                        </div>

                                        {/* Coordinates */}
                                        <div
                                            className="flex items-center gap-3 text-xs font-light text-white/40 pl-5"
                                            style={{ fontFamily: 'monospace' }}
                                        >
                                            <span>Lat: {property.latitude.toFixed(4)}°</span>
                                            <span>•</span>
                                            <span>Long: {property.longitude.toFixed(4)}°</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Financial Details */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs font-light tracking-widest uppercase text-white/40 mb-1">
                                            Purchase Value
                                        </p>
                                        <p className="text-sm font-light text-white/70">
                                            ₹{(property.purchaseValue / 10000000).toFixed(2)} Cr
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-light tracking-widest uppercase text-white/40 mb-1">
                                            Current Value
                                        </p>
                                        <p className="text-sm font-light text-white/90">
                                            ₹{(property.currentValue / 10000000).toFixed(2)} Cr
                                        </p>
                                    </div>
                                </div>

                                {/* Appreciation Badge */}
                                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp size={16} strokeWidth={1.5} className="text-green-400/80" />
                                        <span className="text-sm font-light text-green-400/80">
                                            +{property.appreciation.toFixed(1)}%
                                        </span>
                                        <span className="text-xs font-light text-white/40">appreciation</span>
                                    </div>

                                    {/* View Details Button */}
                                    <button
                                        onClick={() => setSelectedProperty(property)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-light tracking-wider text-white/70 hover:text-white/90 hover:bg-white/5 transition-all duration-200"
                                    >
                                        <Eye size={14} strokeWidth={1.5} />
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Property Details Modal */}
            <PropertyDetails
                property={selectedProperty}
                onClose={() => setSelectedProperty(null)}
            />

            {/* Add Property Modal */}
            <AddPropertyModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddProperty}
            />
        </>
    );
}
