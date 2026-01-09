'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useSource } from '@/context/SourceContext';
import { ChevronRight, UserCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { usePathname } from 'next/navigation';

const sources = ['Real Estate', 'Crypto', 'Shares', 'Bonds', 'Business'] as const;

export default function SourceNav() {
    const { activeSource, setActiveSource } = useSource();
    const [userProfile, setUserProfile] = useState<{ name: string; email: string } | null>(null);
    const pathname = usePathname();

    useEffect(() => {
        const fetchUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserProfile({
                    name: user.user_metadata?.full_name || 'Aether User',
                    email: user.email || '',
                });
            }
        };
        fetchUser();
    }, []);

    // White Glow Color (matching Sidebar)
    const glassStyle = {
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 0 50px 0 rgba(255, 255, 255, 0.05), inset 0 0 20px 0 rgba(255, 255, 255, 0.02)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
    };

    // Breadcrumb Logic - Context Labels
    const contextLabels: Record<string, { Portfolio: string; Transactions: string; Reports: string }> = {
        'Home': { Portfolio: 'All Assets', Transactions: 'Global Activity', Reports: 'System Reports' },
        'Real Estate': { Portfolio: 'Properties', Transactions: 'Rental / Sale', Reports: 'Valuation & Docs' },
        'Crypto': { Portfolio: 'Wallets', Transactions: 'On-chain Activity', Reports: 'Holdings' },
        'Shares': { Portfolio: 'Holdings', Transactions: 'Market Activity', Reports: 'Performance' },
        'Bonds': { Portfolio: 'Fixed Income', Transactions: 'Yield Analysis', Reports: 'Maturity Schedule' },
        'Business': { Portfolio: 'Ventures', Transactions: 'Cash Flow', Reports: 'Statements' },
    };

    const currentLabels = contextLabels[activeSource] || contextLabels['Home'];
    let subSection = '';

    // Map pathname to subsection
    if (pathname.includes('/portfolio')) subSection = currentLabels.Portfolio;
    else if (pathname.includes('/transactions')) subSection = currentLabels.Transactions;
    else if (pathname.includes('/reports')) subSection = currentLabels.Reports;
    else if (pathname.includes('/ai-insights')) subSection = 'AI Insights';
    else if (pathname.includes('/help')) subSection = 'Help Center';
    else if (pathname.includes('/settings')) subSection = 'Settings';
    else if (pathname.includes('/upgrade')) subSection = 'Upgrade';
    // Business-specific routes
    else if (pathname.includes('/business/ventures')) subSection = 'Ventures';
    else if (pathname.includes('/business/cash-flow')) subSection = 'Cash Flow';
    else if (pathname.includes('/business/statements')) subSection = 'Statements';
    else if (pathname.includes('/business/dashboard')) subSection = 'Dashboard';

    return (
        <>
            {/* Breadcrumb Container (Top Left) */}
            <div
                className="fixed top-6 left-[200px] z-50 flex items-center p-1 rounded-full transition-all duration-300 group overflow-hidden"
                style={glassStyle}
            >
                {/* Hover Texture */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out z-0 mix-blend-overlay"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                        opacity: 0.06
                    }}
                />

                <div className="relative z-10 flex items-center gap-2 text-xs font-light tracking-wider px-5 py-2">
                    <button
                        onClick={() => setActiveSource('Home')}
                        className="text-white/90 hover:text-white/70 transition-colors duration-200 outline-none"
                    >
                        Home
                    </button>

                    <AnimatePresence mode='wait'>
                        {(activeSource !== 'Home' || subSection) && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="flex items-center gap-2"
                            >
                                {activeSource !== 'Home' && (
                                    <>
                                        <ChevronRight className="w-3 h-3 text-white/40" />
                                        <span className="text-white/60">{activeSource}</span>
                                    </>
                                )}

                                {subSection && (
                                    <>
                                        <ChevronRight className="w-3 h-3 text-white/40" />
                                        <span className="text-white/60 text-nowrap">{subSection}</span>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* User Profile Widget (Top Right) */}
            {userProfile && (
                <div
                    className="fixed top-6 right-10 z-40 p-1 rounded-full transition-all duration-300 group overflow-hidden"
                    style={glassStyle}
                >
                    {/* Hover Texture */}
                    <div
                        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out z-0 mix-blend-overlay"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                            opacity: 0.06
                        }}
                    />

                    <div className="relative z-10 flex items-center gap-3 px-5 py-2">

                        <UserCircle strokeWidth={1.5} className="relative z-10 w-8 h-8 text-white/80" />
                        <div className="relative z-10 flex flex-col items-end leading-tight">
                            <span className="text-white/90 text-xs font-light tracking-wide">
                                {userProfile.name}
                            </span>
                            <span className="text-white/50 text-xs font-light tracking-wider">
                                {userProfile.email}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Center Navigation Capsule */}
            <div className="fixed top-6 left-0 w-full z-40 flex justify-end pr-[420px] pointer-events-none">
                <nav
                    className="relative flex items-center p-1 rounded-full pointer-events-auto transition-all duration-300 group overflow-hidden"
                    style={glassStyle}
                >
                    {/* Hover Texture */}
                    <div
                        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out z-0 mix-blend-overlay"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                            opacity: 0.06
                        }}
                    />

                    {sources.map((source) => {
                        const isActive = activeSource === source;
                        return (
                            <div
                                key={source}
                                className="rounded-full overflow-hidden transition-all duration-300"
                                style={{
                                    background: isActive ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                                    border: isActive ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid transparent',
                                }}
                            >
                                <button
                                    onClick={() => setActiveSource(source)}
                                    className={`relative z-10 px-5 py-2 text-xs font-light tracking-wider transition-colors duration-300 outline-none ${isActive ? 'text-white/90' : 'text-white/60 hover:text-white/90 hover:bg-[rgba(255,255,255,0.05)]'
                                        }`}
                                >
                                    {source}
                                </button>
                            </div>
                        );
                    })}
                </nav>
            </div>
        </>
    );
}
