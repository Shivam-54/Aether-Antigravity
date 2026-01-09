'use client';

import CryptoHoldings from '@/components/crypto/CryptoHoldings';

export default function HoldingsPage() {
    return (
        <div className="max-w-7xl mx-auto p-8 w-full space-y-8">
            <header>
                <h1 className="text-3xl font-light text-white tracking-tight">Portfolio Holdings</h1>
                <p className="text-sm text-white/40">Detailed breakdown of your crypto assets.</p>
            </header>

            <div className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden">
                <CryptoHoldings />
            </div>
        </div>
    );
}
