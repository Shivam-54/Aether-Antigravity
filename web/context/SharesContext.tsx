'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Share, ShareTransaction, TransactionType, OrderType, TransactionStatus } from '@/types/shares';
import { createClient } from '@/lib/supabase/client';
import { Asset } from '@/types/wealth';
import { mockShares, mockShareTransactions } from '@/lib/mockData/sharesData';

interface SharesContextType {
    shares: Share[];
    transactions: ShareTransaction[];
    loading: boolean;
    addShare: (share: Share) => Promise<void>;
    updateShare: (id: string, updates: Partial<Share>) => Promise<void>;
    deleteShare: (id: string) => Promise<void>;
}

const SharesContext = createContext<SharesContextType | undefined>(undefined);

export function SharesProvider({ children }: { children: ReactNode }) {
    const [shares, setShares] = useState<Share[]>([]);
    const [transactions, setTransactions] = useState<ShareTransaction[]>(mockShareTransactions);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    // Fetch Shares from Supabase
    const fetchShares = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('assets')
                .select('*')
                .eq('type', 'SHARE');

            if (error) {
                console.warn('Error fetching shares (falling back to mock):', error);
                setShares(mockShares);
                return;
            }

            if (data && data.length > 0) {
                const mappedShares: Share[] = data.map((asset: Asset) => ({
                    id: asset.id,
                    symbol: asset.meta?.symbol || '',
                    companyName: asset.name,
                    sector: asset.meta?.sector || 'Broad Market',
                    quantity: Number(asset.quantity) || 0,
                    avgBuyPrice: asset.cost_basis ? Number(asset.cost_basis) / (Number(asset.quantity) || 1) : 0,
                    currentPrice: asset.value / (Number(asset.quantity) || 1), // Derived current price
                    totalValue: asset.value,
                    totalInvested: Number(asset.cost_basis) || 0,
                    gainLoss: asset.value - (Number(asset.cost_basis) || 0),
                    gainLossPercent: asset.cost_basis ? ((asset.value - Number(asset.cost_basis)) / Number(asset.cost_basis)) * 100 : 0,
                    acquisitionDate: asset.created_at,
                    holdingDuration: asset.meta?.holdingDuration || 'Short'
                }));
                setShares(mappedShares);
                if (typeof window !== 'undefined') {
                    localStorage.setItem('seeded_SHARES', 'true');
                }
            } else {
                const hasSeeded = typeof window !== 'undefined' ? localStorage.getItem('seeded_SHARES') : false;

                if (!hasSeeded) {
                    setShares(mockShares);
                    const seedDB = async () => {
                        const { data: { user } } = await supabase.auth.getUser();
                        if (!user) return;

                        for (const share of mockShares) {
                            await supabase.from('assets').insert({
                                user_id: user.id,
                                type: 'SHARE',
                                name: share.companyName,
                                value: share.totalValue,
                                quantity: share.quantity,
                                cost_basis: share.totalInvested,
                                meta: {
                                    symbol: share.symbol,
                                    sector: share.sector,
                                    holdingDuration: share.holdingDuration
                                }
                            });
                        }
                        if (typeof window !== 'undefined') {
                            localStorage.setItem('seeded_SHARES', 'true');
                        }
                    };
                    seedDB();
                } else {
                    setShares([]);
                }
            }
        } catch (err) {
            console.error('Unexpected error fetching shares:', err);
            setShares(mockShares);
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchShares();
    }, [fetchShares]);

    // CRUD Operations
    const addShare = async (share: Share) => {
        // Optimistic Update
        setShares(prev => [...prev, share]);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('assets')
                .insert({
                    user_id: user.id,
                    type: 'SHARE',
                    name: share.companyName,
                    value: share.totalValue,
                    quantity: share.quantity,
                    cost_basis: share.totalInvested,
                    meta: {
                        symbol: share.symbol,
                        sector: share.sector,
                        holdingDuration: share.holdingDuration
                    }
                })
                .select()
                .single();

            if (error) throw error;

            if (data) {
                setShares(prev => prev.map(s => s.id === share.id ? { ...s, id: data.id } : s));
            }

        } catch (err) {
            console.error('Error saving share to DB:', err);
        }
    };

    const updateShare = async (id: string, updates: Partial<Share>) => {
        // Optimistic Update
        setShares(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));

        const share = shares.find(s => s.id === id);
        if (!share) return;
        const merged = { ...share, ...updates };

        try {
            const { error } = await supabase
                .from('assets')
                .update({
                    name: merged.companyName,
                    value: merged.totalValue,
                    quantity: merged.quantity,
                    cost_basis: merged.totalInvested,
                    meta: {
                        symbol: merged.symbol,
                        sector: merged.sector,
                        holdingDuration: merged.holdingDuration
                    }
                })
                .eq('id', id);

            if (error) console.error('Error updating share in DB:', error);

        } catch (err) {
            console.error('Unexpected error updating share:', err);
        }
    };

    const deleteShare = async (id: string) => {
        // Optimistic Update
        setShares(prev => prev.filter(s => s.id !== id));

        try {
            const { error } = await supabase
                .from('assets')
                .delete()
                .eq('id', id);

            if (error) console.error('Error deleting share from DB:', error);

        } catch (err) {
            console.error('Unexpected error deleting share:', err);
        }
    };

    return (
        <SharesContext.Provider value={{
            shares,
            transactions,
            loading,
            addShare,
            updateShare,
            deleteShare
        }}>
            {children}
        </SharesContext.Provider>
    );
}

export function useShares() {
    const context = useContext(SharesContext);
    if (context === undefined) {
        throw new Error('useShares must be used within a SharesProvider');
    }
    return context;
}
