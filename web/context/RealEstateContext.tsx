'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Property, RealEstateTransaction, PropertyDocument, AIInsight, RentalInfo, SaleInfo, PropertyStatus, PropertyType, OwnershipStructure } from '@/types/realestate';
import { createClient } from '@/lib/supabase/client';
import { Asset } from '@/types/wealth';
import {
    mockTransactions,
    mockDocuments,
    mockAIInsights,
    mockProperties
} from '@/lib/mockData/realEstateData';

interface RealEstateContextType {
    // Properties
    properties: Property[];
    addProperty: (property: Property) => Promise<void>;
    updateProperty: (id: string, updates: Partial<Property>) => Promise<void>;
    deleteProperty: (id: string) => Promise<void>;
    loading: boolean;

    // Transactions
    transactions: RealEstateTransaction[];
    addTransaction: (transaction: RealEstateTransaction) => void;

    // Documents
    documents: PropertyDocument[];
    addDocument: (document: PropertyDocument) => void;

    // AI Insights
    insights: AIInsight[];

    // Lifecycle Management
    rentProperty: (id: string, rentalInfo: RentalInfo) => Promise<void>;
    endRent: (id: string) => Promise<void>;
    sellProperty: (id: string, saleInfo: SaleInfo) => Promise<void>;
    calculateRentalIncome: () => number;
}

const RealEstateContext = createContext<RealEstateContextType | undefined>(undefined);

export function RealEstateProvider({ children }: { children: ReactNode }) {
    const [properties, setProperties] = useState<Property[]>([]);
    const [transactions, setTransactions] = useState<RealEstateTransaction[]>([]);
    const [documents, setDocuments] = useState<PropertyDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    // Fetch Properties from Supabase (no mock data fallback)
    const fetchProperties = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('assets')
                .select('*')
                .eq('type', 'REAL_ESTATE');

            if (error) {
                console.warn('Error fetching properties:', error);
                setProperties([]); // Set to empty array on error
                return;
            }

            if (data && data.length > 0) {
                const mappedProperties: Property[] = data.map((asset: Asset) => ({
                    id: asset.id,
                    name: asset.name,

                    // Address & Location
                    streetAddress: asset.meta?.streetAddress || '',
                    city: asset.meta?.city || '',
                    state: asset.meta?.state || '',
                    zipCode: asset.meta?.zipCode || '',
                    location: asset.meta?.city && asset.meta?.state ? `${asset.meta.city}, ${asset.meta.state}` : '',
                    latitude: asset.meta?.latitude || 0,
                    longitude: asset.meta?.longitude || 0,

                    // Specs
                    propertyType: asset.meta?.propertyType || 'Residential',
                    landArea: asset.meta?.landArea || 0,
                    landUnit: asset.meta?.landUnit || 'sq ft',
                    bedrooms: asset.meta?.bedrooms,
                    bathrooms: asset.meta?.bathrooms,

                    // Financial
                    purchaseValue: asset.meta?.purchaseValue || 0,
                    currentValue: asset.value,
                    outstandingMortgage: asset.meta?.outstandingMortgage || 0,
                    equity: asset.value - (asset.meta?.outstandingMortgage || 0),
                    loanToValue: asset.value > 0 ? ((asset.meta?.outstandingMortgage || 0) / asset.value) * 100 : 0,
                    appreciation: asset.meta?.appreciation || 0,

                    // Ownership
                    acquisitionDate: asset.meta?.acquisitionDate || asset.created_at,
                    ownershipStructure: asset.meta?.ownershipStructure || 'Individual',
                    holdingDuration: asset.meta?.holdingDuration || '0 years',

                    // Lifecycle
                    status: asset.meta?.status || PropertyStatus.Owned,
                    rentalInfo: asset.meta?.rentalInfo,
                    saleInfo: asset.meta?.saleInfo
                }));
                setProperties(mappedProperties);
            } else {
                // No data found - show empty state
                setProperties([]);
            }
        } catch (err) {
            console.error('Unexpected error fetching properties:', err);
            setProperties([]);
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchProperties();
    }, [fetchProperties]);


    // Derived AI Insights
    // In a real app, this would call an API. Here we simulate dynamic logic based on actual user data.
    const insights: AIInsight[] = properties.length > 0 ? (() => {
        const generatedInsights: AIInsight[] = [];

        const owned = properties.filter(p => p.status === PropertyStatus.Owned);
        const rented = properties.filter(p => p.status === PropertyStatus.Rented);
        const sold = properties.filter(p => p.status === PropertyStatus.Sold);
        const activeCount = owned.length + rented.length;

        // 1. Occupancy Insight
        if (activeCount > 0) {
            const occupancyRate = (rented.length / activeCount) * 100;
            if (occupancyRate < 30 && owned.length > 1) {
                generatedInsights.push({
                    id: 'ins-dyn-1',
                    message: `Low occupancy rate (${occupancyRate.toFixed(0)}%). Consider renting out ${owned.length} vacant properties to boost cash flow.`,
                    impact: 'High',
                    confidence: 85,
                    category: 'optimization'
                });
            } else if (occupancyRate > 80) {
                generatedInsights.push({
                    id: 'ins-dyn-2',
                    message: `High occupancy rate (${occupancyRate.toFixed(0)}%). Your portfolio is generating consistent cash flow.`,
                    impact: 'Medium',
                    confidence: 90,
                    category: 'opportunity'
                });
            }
        }

        // 2. Rental Yield Insight
        if (rented.length > 0) {
            const totalValuation = rented.reduce((sum, p) => sum + p.currentValue, 0);
            const totalMonthlyRent = rented.reduce((sum, p) => sum + (p.rentalInfo?.rentAmount || 0), 0);
            const annualYield = totalValuation > 0 ? ((totalMonthlyRent * 12) / totalValuation) * 100 : 0;

            if (annualYield < 2) {
                generatedInsights.push({
                    id: 'ins-dyn-3',
                    message: `Portfolio rental yield is low (${annualYield.toFixed(1)}%). Review rental pricing or consider renovations.`,
                    impact: 'High',
                    confidence: 80,
                    category: 'risk'
                });
            }
        }

        // 3. Geographic Concentration
        const cityCounts: Record<string, number> = {};
        properties.forEach(p => { cityCounts[p.city] = (cityCounts[p.city] || 0) + 1; });
        Object.entries(cityCounts).forEach(([city, count]) => {
            if (count > 2 && count / properties.length > 0.5) {
                generatedInsights.push({
                    id: `ins-dyn-geo-${city}`,
                    message: `High concentration risk in ${city} (${((count / properties.length) * 100).toFixed(0)}% of assets). Diversify location.`,
                    impact: 'Medium',
                    confidence: 75,
                    category: 'risk'
                });
            }
        });

        // 4. Sales success
        if (sold.length > 0) {
            generatedInsights.push({
                id: 'ins-dyn-sales',
                message: `You have sold ${sold.length} properties. Ensure you reinvest capital gains to maintain compounding growth.`,
                impact: 'Medium',
                confidence: 95,
                category: 'opportunity'
            });
        }

        return generatedInsights;
    })() : []; // Empty array if no properties

    // Property management functions
    const addProperty = async (property: Property) => {
        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                console.error('No authenticated user found');
                return;
            }

            const meta = {
                // Address & Location
                streetAddress: property.streetAddress,
                city: property.city,
                state: property.state,
                zipCode: property.zipCode,
                latitude: property.latitude,
                longitude: property.longitude,

                // Specs
                propertyType: property.propertyType,
                landArea: property.landArea,
                landUnit: property.landUnit,
                bedrooms: property.bedrooms,
                bathrooms: property.bathrooms,

                // Financial
                purchaseValue: property.purchaseValue,
                outstandingMortgage: property.outstandingMortgage,
                appreciation: property.appreciation,

                // Ownership
                acquisitionDate: property.acquisitionDate,
                ownershipStructure: property.ownershipStructure,
                holdingDuration: property.holdingDuration,

                // Lifecycle
                status: property.status
            };

            const { data, error } = await supabase
                .from('assets')
                .insert({
                    user_id: user.id,
                    type: 'REAL_ESTATE',
                    name: property.name,
                    value: property.currentValue,
                    meta: meta
                })
                .select()
                .single();

            if (error) throw error;

            if (data) {
                // Update local state re-using the logic from fetchProperties (simplified local creation)
                const newProperty: Property = {
                    ...property,
                    id: data.id, // Use the ID from Supabase
                };
                setProperties(prev => [...prev, newProperty]);

                // Also add a corresponding transaction (kept local for now as per plan)
                const transaction: RealEstateTransaction = {
                    id: `txn-${Date.now()}`,
                    propertyId: data.id,
                    propertyName: property.name,
                    type: 'Buy',
                    value: property.purchaseValue,
                    paymentMethod: 'Mixed',
                    date: property.acquisitionDate,
                    holdingDuration: property.holdingDuration
                };
                setTransactions(prev => [...prev, transaction]);
            }

        } catch (err) {
            console.error('Error adding property:', err);
        }
    };

    const updateProperty = async (id: string, updates: Partial<Property>) => {
        try {
            // 1. Optimistic Update
            setProperties(prev =>
                prev.map(prop =>
                    prop.id === id ? { ...prop, ...updates } : prop
                )
            );

            // 2. Prepare payload for Supabase
            // We need to fetch the existing property to merge meta correctly, 
            // but we have it in our local state (pre-update).
            const existingProp = properties.find(p => p.id === id);
            if (!existingProp) return;

            const merged = { ...existingProp, ...updates };

            const metaUpdate = {
                streetAddress: merged.streetAddress,
                city: merged.city,
                state: merged.state,
                zipCode: merged.zipCode,
                latitude: merged.latitude,
                longitude: merged.longitude,
                propertyType: merged.propertyType,
                landArea: merged.landArea,
                landUnit: merged.landUnit,
                bedrooms: merged.bedrooms,
                bathrooms: merged.bathrooms,
                purchaseValue: merged.purchaseValue,
                outstandingMortgage: merged.outstandingMortgage,
                acquisitionDate: merged.acquisitionDate,
                ownershipStructure: merged.ownershipStructure,
                holdingDuration: merged.holdingDuration,
                appreciation: merged.appreciation,
                status: merged.status,
                rentalInfo: merged.rentalInfo,
                saleInfo: merged.saleInfo
            };

            const { error } = await supabase
                .from('assets')
                .update({
                    name: merged.name,
                    value: merged.currentValue,
                    meta: metaUpdate
                })
                .eq('id', id);

            if (error) {
                // Revert optimistic update on error
                console.error('Error updating property in DB:', error);
                setProperties(prev =>
                    prev.map(prop =>
                        prop.id === id ? existingProp : prop
                    )
                );
            }

        } catch (err) {
            console.error('Unexpected error updating property:', err);
        }
    };

    const deleteProperty = async (id: string) => {
        try {
            // Optimistic update
            const params = properties;
            setProperties(prev => prev.filter(prop => prop.id !== id));
            setTransactions(prev => prev.filter(txn => txn.propertyId !== id));
            setDocuments(prev => prev.filter(doc => doc.propertyId !== id));

            const { error } = await supabase
                .from('assets')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting property:', error);
                // Revert
                setProperties(params);
            }

        } catch (err) {
            console.error('Unexpected error deleting property:', err);
        }
    };

    const addTransaction = (transaction: RealEstateTransaction) => {
        setTransactions(prev => [...prev, transaction]);
    };

    const addDocument = (document: PropertyDocument) => {
        setDocuments(prev => [...prev, document]);
    };

    // Lifecycle management functions
    const rentProperty = async (id: string, rentalInfo: RentalInfo) => {
        const property = properties.find(p => p.id === id);
        if (!property) return;

        // Uses updateProperty which handles DB sync
        await updateProperty(id, {
            status: PropertyStatus.Rented,
            rentalInfo
        });

        // Add rent transaction (Local)
        const transaction: RealEstateTransaction = {
            id: `txn-${Date.now()}`,
            propertyId: property.id,
            propertyName: property.name,
            type: 'Rent',
            value: rentalInfo.rentAmount,
            paymentMethod: 'Cash',
            date: rentalInfo.startDate,
            holdingDuration: undefined
        };
        setTransactions(prev => [...prev, transaction]);
    };

    const endRent = async (id: string) => {
        const property = properties.find(p => p.id === id);
        if (!property) return;

        // Uses updateProperty which handles DB sync
        await updateProperty(id, {
            status: PropertyStatus.Owned,
            rentalInfo: { ...property.rentalInfo!, endDate: new Date().toISOString().split('T')[0] }
        });
    };

    const sellProperty = async (id: string, saleInfo: SaleInfo) => {
        const property = properties.find(p => p.id === id);
        if (!property) return;

        // Uses updateProperty which handles DB sync
        await updateProperty(id, {
            status: PropertyStatus.Sold,
            saleInfo
        });

        // Add sell transaction (Local)
        const transaction: RealEstateTransaction = {
            id: `txn-${Date.now()}`,
            propertyId: property.id,
            propertyName: property.name,
            type: 'Sell',
            value: saleInfo.sellingPrice,
            paymentMethod: saleInfo.paymentMode,
            date: saleInfo.saleDate,
            holdingDuration: property.holdingDuration,
            netGainLoss: saleInfo.capitalGain
        };
        setTransactions(prev => [...prev, transaction]);
    };

    const calculateRentalIncome = () => {
        return properties
            .filter(p => p.status === PropertyStatus.Rented && p.rentalInfo)
            .reduce((sum, p) => sum + (p.rentalInfo!.rentAmount || 0), 0);
    };

    return (
        <RealEstateContext.Provider
            value={{
                properties,
                addProperty,
                updateProperty,
                deleteProperty,
                loading,
                transactions,
                addTransaction,
                documents,
                addDocument,
                insights,
                rentProperty,
                endRent,
                sellProperty,
                calculateRentalIncome
            }}
        >
            {children}
        </RealEstateContext.Provider>
    );
}

export function useRealEstate() {
    const context = useContext(RealEstateContext);
    if (context === undefined) {
        throw new Error('useRealEstate must be used within a RealEstateProvider');
    }
    return context;
}
