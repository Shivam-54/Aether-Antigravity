'use client';

import { useState } from 'react';
import CryptoHoldings from '@/components/crypto/CryptoHoldings';
import AddCryptoModal from '@/components/crypto/AddCryptoModal';
import { useCrypto } from '@/context/CryptoContext';
import { Plus } from 'lucide-react';

export default function HoldingsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { addCrypto } = useCrypto();

    return (
        <div className="max-w-7xl mx-auto p-8 w-full space-y-8">
            <header className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-light text-white tracking-tight">Portfolio Holdings</h1>
                    <p className="text-sm text-white/40">Detailed breakdown of your crypto assets.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/15 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Crypto
                </button>
            </header>

            <div className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden">
                <CryptoHoldings />
            </div>

            <AddCryptoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={addCrypto}
            />
        </div>
    );
}
