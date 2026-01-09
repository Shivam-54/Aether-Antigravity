'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Bond, BondStatus, BondType, BondMetric } from '@/types/bonds';
import { createClient } from '@/lib/supabase/client';
import { Asset } from '@/types/wealth';
import { mockBonds, mockBondMetrics } from '@/lib/mockData/bondsData';

interface BondsContextType {
    bonds: Bond[];
    metrics: BondMetric[];
    loading: boolean;
    addBond: (bond: Bond) => Promise<void>;
    updateBond: (id: string, updates: Partial<Bond>) => Promise<void>;
    deleteBond: (id: string) => Promise<void>;
}

const BondsContext = createContext<BondsContextType | undefined>(undefined);

export function BondsProvider({ children }: { children: ReactNode }) {
    const [bonds, setBonds] = useState<Bond[]>([]);
    const [metrics, setMetrics] = useState<BondMetric[]>(mockBondMetrics);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    // Fetch Bonds from Supabase
    const fetchBonds = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('assets')
                .select('*')
                .eq('type', 'BOND');

            if (error) {
                console.warn('Error fetching bonds (falling back to mock):', error);
                setBonds(mockBonds);
                return;
            }

            if (data && data.length > 0) {
                const mappedBonds: Bond[] = data.map((asset: Asset) => ({
                    id: asset.id,
                    ticker: asset.meta?.ticker || '',
                    description: asset.name,
                    issuer: asset.meta?.issuer || '',
                    faceValue: Number(asset.quantity) || 0, // Using quantity as Fac Value
                    couponRate: asset.meta?.couponRate || 0,
                    maturityDate: asset.meta?.maturityDate || '',
                    purchaseDate: asset.created_at,
                    type: asset.meta?.type || 'Corporate',
                    status: asset.meta?.status || 'Active',
                    yieldToMaturity: asset.meta?.yieldToMaturity || 0,
                    currentPrice: asset.value, // Total Current Value
                    currency: 'INR'
                }));
                setBonds(mappedBonds);
                if (typeof window !== 'undefined') {
                    localStorage.setItem('seeded_BONDS', 'true');
                }
            } else {
                const hasSeeded = typeof window !== 'undefined' ? localStorage.getItem('seeded_BONDS') : false;

                if (!hasSeeded) {
                    setBonds(mockBonds);
                    const seedDB = async () => {
                        const { data: { user } } = await supabase.auth.getUser();
                        if (!user) return;

                        for (const bond of mockBonds) {
                            await supabase.from('assets').insert({
                                user_id: user.id,
                                type: 'BOND',
                                name: bond.description,
                                value: bond.currentPrice,
                                quantity: bond.faceValue,
                                meta: {
                                    ticker: bond.ticker,
                                    issuer: bond.issuer,
                                    couponRate: bond.couponRate,
                                    maturityDate: bond.maturityDate,
                                    type: bond.type,
                                    status: bond.status,
                                    yieldToMaturity: bond.yieldToMaturity
                                }
                            });
                        }
                        if (typeof window !== 'undefined') {
                            localStorage.setItem('seeded_BONDS', 'true');
                        }
                    };
                    seedDB();
                } else {
                    setBonds([]);
                }
            }
        } catch (err) {
            console.error('Unexpected error fetching bonds:', err);
            setBonds(mockBonds);
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchBonds();
    }, [fetchBonds]);

    // CRUD Operations
    const addBond = async (bond: Bond) => {
        // Optimistic Update
        setBonds(prev => [...prev, bond]);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('assets')
                .insert({
                    user_id: user.id,
                    type: 'BOND',
                    name: bond.description,
                    value: bond.currentPrice,
                    quantity: bond.faceValue,
                    meta: {
                        ticker: bond.ticker,
                        issuer: bond.issuer,
                        couponRate: bond.couponRate,
                        maturityDate: bond.maturityDate,
                        type: bond.type,
                        status: bond.status,
                        yieldToMaturity: bond.yieldToMaturity
                    }
                })
                .select()
                .single();

            if (error) throw error;

            if (data) {
                setBonds(prev => prev.map(b => b.id === bond.id ? { ...b, id: data.id } : b));
            }

        } catch (err) {
            console.error('Error saving bond to DB:', err);
        }
    };

    const updateBond = async (id: string, updates: Partial<Bond>) => {
        setBonds(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));

        const bond = bonds.find(b => b.id === id);
        if (!bond) return;
        const merged = { ...bond, ...updates };

        try {
            const { error } = await supabase
                .from('assets')
                .update({
                    name: merged.description,
                    value: merged.currentPrice,
                    quantity: merged.faceValue,
                    meta: {
                        ticker: merged.ticker,
                        issuer: merged.issuer,
                        couponRate: merged.couponRate,
                        maturityDate: merged.maturityDate,
                        type: merged.type,
                        status: merged.status,
                        yieldToMaturity: merged.yieldToMaturity
                    }
                })
                .eq('id', id);

            if (error) console.error('Error updating bond in DB:', error);

        } catch (err) {
            console.error('Unexpected error updating bond:', err);
        }
    };

    const deleteBond = async (id: string) => {
        setBonds(prev => prev.filter(b => b.id !== id));

        try {
            const { error } = await supabase
                .from('assets')
                .delete()
                .eq('id', id);

            if (error) console.error('Error deleting bond from DB:', error);

        } catch (err) {
            console.error('Unexpected error deleting bond:', err);
        }
    };

    return (
        <BondsContext.Provider value={{
            bonds,
            metrics,
            loading,
            addBond,
            updateBond,
            deleteBond
        }}>
            {children}
        </BondsContext.Provider>
    );
}

export function useBonds() {
    const context = useContext(BondsContext);
    if (context === undefined) {
        throw new Error('useBonds must be used within a BondsProvider');
    }
    return context;
}
