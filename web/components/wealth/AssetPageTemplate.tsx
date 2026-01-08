'use client';

import { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, Trash2 } from 'lucide-react';
import { Asset, AssetType } from '@/types/wealth';
import { createClient } from '@/lib/supabase/client';
import AddAssetModal from './AddAssetModal';

interface AssetPageProps {
    type: AssetType;
    title: string;
    description: string;
}

export default function AssetPageTemplate({ type, title, description }: AssetPageProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchAssets();
    }, []);

    const fetchAssets = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { data, error } = await supabase
                .from('assets')
                .select('*')
                .eq('type', type)
                .order('value', { ascending: false });

            if (data) setAssets(data);
        } catch (error) {
            console.error('Error fetching assets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this asset?')) return;

        try {
            await supabase.from('assets').delete().eq('id', id);
            setAssets(assets.filter(a => a.id !== id));
        } catch (error) {
            console.error('Error deleting asset:', error);
        }
    };

    const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);

    return (
        <div className="space-y-8">
            <AddAssetModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    fetchAssets();
                }}
                type={type}
                title={title}
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-light text-white mb-2">{title}</h1>
                    <p className="text-white/40 text-sm max-w-md">{description}</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors w-fit"
                >
                    <Plus size={18} />
                    Add {title}
                </button>
            </div>

            {/* Stats Card */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md w-full md:w-1/3">
                <p className="text-white/40 text-xs uppercase tracking-widest font-medium mb-2">Total {title} Value</p>
                <h3 className="text-4xl font-light text-white">
                    ${totalValue.toLocaleString()}
                </h3>
            </div>

            {/* Assets List */}
            <div className="space-y-4">
                <h3 className="text-white/60 text-sm uppercase tracking-widest pl-2">Your Holdings</h3>

                {loading ? (
                    <div className="text-white/30 text-sm pl-2">Loading assets...</div>
                ) : assets.length === 0 ? (
                    <div className="text-white/30 text-sm pl-2 italic">No assets found. Add your first {title.toLowerCase()} to get started.</div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {assets.map((asset) => (
                            <div key={asset.id} className="group bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all flex items-center justify-between">
                                <div>
                                    <h4 className="text-lg font-medium text-white mb-1">{asset.name}</h4>
                                    <p className="text-xs text-white/40">Added on {new Date(asset.created_at).toLocaleDateString()}</p>
                                </div>

                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                        <p className="text-lg text-white font-medium">${asset.value.toLocaleString()}</p>
                                        {/* Placeholder for future gain/loss calc */}
                                        <div className="flex items-center justify-end gap-1 text-xs text-white/40">
                                            <span>Current Value</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDelete(asset.id)}
                                        className="text-white/20 hover:text-red-400 transition-colors p-2"
                                        title="Delete Asset"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
