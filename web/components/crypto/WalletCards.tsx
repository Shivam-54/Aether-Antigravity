'use client';

import React from 'react';
import { useCrypto, CryptoWallet } from '@/context/CryptoContext';
import { Wallet, ShieldCheck, Clock, ExternalLink, Wifi, WifiOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WalletCards() {
    const { wallets, loading } = useCrypto();

    if (loading) return <div className="p-10 text-white/50 animate-pulse">Scanning wallets...</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {wallets.map((wallet, index) => (
                <WalletCard key={wallet.id} wallet={wallet} index={index} />
            ))}

            {/* Add New Wallet Placeholder */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="group border border-dashed border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 text-white/30 hover:bg-white/[0.02] hover:text-white/60 hover:border-white/20 transition-all duration-300 min-h-[280px]"
            >
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                    <Wallet size={20} strokeWidth={1} />
                </div>
                <span className="text-sm font-light tracking-wide">Connect Wallet</span>
            </motion.button>
        </div>
    );
}

function WalletCard({ wallet, index }: { wallet: CryptoWallet, index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-md p-8 flex flex-col justify-between min-h-[280px] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300"
        >
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/5">
                        <ShieldCheck size={18} className="text-white/70" />
                    </div>
                    <div>
                        <h3 className="text-base font-medium text-white tracking-tight">{wallet.name}</h3>
                        <div className="text-xs text-white/40 font-mono tracking-wide flex items-center gap-2">
                            {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                            <ExternalLink size={10} className="opacity-50 hover:opacity-100 cursor-pointer" />
                        </div>
                    </div>
                </div>

                <div className={`px-3 py-1 rounded-full text-[10px] font-medium border flex items-center gap-1.5 ${wallet.is_connected ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                    {wallet.is_connected ? <Wifi size={10} /> : <WifiOff size={10} />}
                    {wallet.is_connected ? 'Connected' : 'Offline'}
                </div>
            </div>

            {/* Network Badge */}
            <div className="mt-6">
                <span className="inline-block px-3 py-1 rounded-md bg-white/5 text-[10px] uppercase tracking-wider text-white/50 border border-white/5">
                    {wallet.network}
                </span>
            </div>

            <div className="flex-grow" />

            {/* Footer Stats */}
            <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
                <div>
                    <div className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Total Assets</div>
                    <div className="text-xl font-light text-white">{wallet.asset_count}</div>
                </div>
                <div>
                    <div className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Value</div>
                    <div className="text-xl font-light text-white">₹{(wallet.total_value / 100000).toFixed(2)}L</div>
                </div>
            </div>
        </motion.div>
    );
}
