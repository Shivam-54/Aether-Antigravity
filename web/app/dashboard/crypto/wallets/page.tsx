'use client';

import WalletCards from '@/components/crypto/WalletCards';

export default function WalletsPage() {
    return (
        <div className="max-w-7xl mx-auto p-8 w-full space-y-8">
            <header>
                <h1 className="text-3xl font-light text-white tracking-tight">Connected Wallets</h1>
                <p className="text-sm text-white/40">Manage your diverse storage solutions.</p>
            </header>

            <WalletCards />
        </div>
    );
}
