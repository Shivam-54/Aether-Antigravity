'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { AssetType } from '@/types/wealth';
import { useRouter } from 'next/navigation';

interface AddAssetModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: AssetType;
    title: string;
}

export default function AddAssetModal({ isOpen, onClose, type, title }: AddAssetModalProps) {
    const [name, setName] = useState('');
    const [value, setValue] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { error } = await supabase
                .from('assets')
                .insert({
                    user_id: session.user.id,
                    type,
                    name,
                    value: parseFloat(value),
                    meta: {} // Can add specific fields later
                });

            if (error) throw error;

            router.refresh();
            onClose();
            setName('');
            setValue('');
        } catch (error) {
            console.error('Error adding asset:', error);
            alert('Failed to add asset');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-light text-white">Add {title}</h3>
                    <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Asset Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={`e.g. ${title === 'Real Estate' ? 'Downtown Apartment' : 'Asset Name'}`}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Current Value ($)</label>
                        <input
                            type="number"
                            required
                            step="0.01"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-black font-medium py-3 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 mt-4"
                    >
                        {loading ? 'Adding...' : 'Add Asset'}
                    </button>
                </form>
            </div>
        </div>
    );
}
