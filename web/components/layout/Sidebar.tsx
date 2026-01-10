'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ArrowLeftRight, Settings, LogOut, FileText, PieChart, Sparkles, HelpCircle, Crown, Calendar, TrendingUp, Wallet, Activity, Binary } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useSource } from '@/context/SourceContext';

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const [hoveredPath, setHoveredPath] = useState<string | null>(null);
    const { activeSource } = useSource();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    // Dynamic Navigation Logic
    const getNavItems = () => {
        if (activeSource === 'Bonds') {
            return [
                { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
                { name: 'Holdings', path: '/dashboard/fixed-income', icon: FileText },
                { name: 'Maturity Schedule', path: '/dashboard/maturity', icon: Calendar },
                { name: 'Bond Allocation', path: '/dashboard/allocation', icon: PieChart },
                { name: 'Yield Analysis', path: '/dashboard/yield', icon: TrendingUp },
                { name: 'AI Insights', path: '/dashboard/ai-insights', icon: Sparkles },
            ];
        }

        if (activeSource === 'Crypto') {
            return [
                { name: 'Dashboard', path: '/dashboard/crypto', icon: LayoutDashboard },
                { name: 'Holdings', path: '/dashboard/crypto/holdings', icon: PieChart },
                { name: 'On-Chain Activity', path: '/dashboard/crypto/activity', icon: Activity },
                { name: 'Wallets', path: '/dashboard/crypto/wallets', icon: Wallet },
                { name: 'AI Insights', path: '/dashboard/crypto/insights', icon: Sparkles },
            ];
        }

        if (activeSource === 'Business') {
            return [
                { name: 'Dashboard', path: '/dashboard/business/dashboard', icon: LayoutDashboard },
                { name: 'Ventures', path: '/dashboard/business/ventures', icon: Binary },
                { name: 'Cash Flow', path: '/dashboard/business/cash-flow', icon: ArrowLeftRight },
                { name: 'Statements', path: '/dashboard/business/statements', icon: FileText },
                { name: 'AI Insights', path: '/dashboard/business/ai-insights', icon: Sparkles },
            ];
        }

        // Default Context Labels for other sources
        const contextLabels: Record<string, { Portfolio: string; Transactions: string; Reports: string }> = {
            'Home': { Portfolio: 'All Assets', Transactions: 'Global Activity', Reports: 'System Reports' },
            'Real Estate': { Portfolio: 'Properties', Transactions: 'Rental / Sale', Reports: 'Valuation & Docs' },
            'Crypto': { Portfolio: 'Wallets', Transactions: 'On-chain Activity', Reports: 'Holdings' },
            'Shares': { Portfolio: 'Holdings', Transactions: 'Market Activity', Reports: 'Performance' },
            'Business': { Portfolio: 'Ventures', Transactions: 'Cash Flow', Reports: 'Statements' },
        };

        const contextRoutes: Record<string, { Portfolio: string; Transactions: string; Reports: string }> = {
            'Shares': { Portfolio: '/dashboard/shares/holdings', Transactions: '/dashboard/transactions', Reports: '/dashboard/reports' },
        };

        const currentLabels = contextLabels[activeSource] || contextLabels['Home'];
        const currentRoutes = contextRoutes[activeSource];

        return [
            { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
            { name: currentLabels.Portfolio, path: currentRoutes?.Portfolio || '/dashboard/portfolio', icon: PieChart },
            { name: currentLabels.Transactions, path: currentRoutes?.Transactions || '/dashboard/transactions', icon: ArrowLeftRight },
            { name: currentLabels.Reports, path: currentRoutes?.Reports || '/dashboard/reports', icon: FileText },
            { name: 'AI Insights', path: '/dashboard/ai-insights', icon: Sparkles },
        ];
    };

    const navItems = getNavItems();

    const bottomItems = [
        { name: 'Upgrade', path: '/dashboard/upgrade', icon: Crown },
        { name: 'Help', path: '/dashboard/help', icon: HelpCircle },
        { name: 'Settings', path: '/dashboard/settings', icon: Settings },
    ];

    return (
        <aside className="fixed left-4 top-4 bottom-4 w-40 flex flex-col z-50 pointer-events-none">
            {/* 
                Glass Container (Suspended Sheet)
                - Exact match to landing page containers
                - White glow, thin border, noise texture feel
            */}
            <div
                className="absolute inset-0 rounded-3xl pointer-events-auto transition-all duration-300"
                style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 0 50px 0 rgba(255, 255, 255, 0.05), inset 0 0 20px 0 rgba(255, 255, 255, 0.02)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                }}
            />

            {/* Branding - Quiet Aether Mark */}
            <div className="relative h-20 flex items-center px-6 z-10">
                <span className="text-white/90 text-sm font-medium tracking-[0.2em] uppercase opacity-90">
                    Aether
                </span>
            </div>

            {/* Navigation */}
            <nav
                className="relative flex-1 flex flex-col px-2 z-10 overflow-y-auto no-scrollbar pointer-events-auto"
                onMouseLeave={() => setHoveredPath(null)}
            >
                <div className="flex flex-col space-y-0.5">
                    {navItems.map((item) => (
                        <NavItem
                            key={item.path}
                            item={item}
                            pathname={pathname}
                        />
                    ))}
                </div>

                {/* Subtle Divider */}
                <div className="my-4 px-3">
                    <div className="h-px bg-white/5 w-full" />
                </div>

                <div className="flex flex-col space-y-0.5">
                    {bottomItems.map((item) => (
                        <NavItem
                            key={item.path}
                            item={item}
                            pathname={pathname}
                        />
                    ))}

                    {/* Logout Button (Custom behavior) */}
                    <button
                        onClick={handleLogout}
                        className="relative group flex items-center gap-2.5 px-3 py-2 rounded-full outline-none transition-colors duration-200 mt-2"
                        onMouseEnter={() => setHoveredPath('logout')}
                    >
                        {hoveredPath === 'logout' && (
                            <motion.div
                                layoutId="sidebar-item-indicator"
                                className="absolute inset-0 rounded-full bg-white/5 border border-white/5 z-0"
                                transition={{
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 35,
                                }}
                            />
                        )}
                        <LogOut size={16} strokeWidth={1.5} className="relative z-10 text-white/40 group-hover:text-white/70 transition-colors duration-200" />
                        <span className="relative z-10 text-xs font-medium tracking-wide text-white/40 group-hover:text-white/70 transition-colors duration-200">
                            Log Out
                        </span>
                    </button>
                </div>
            </nav>
        </aside>
    );
}

function NavItem({ item, pathname }: {
    item: { name: string, path: string, icon: any },
    pathname: string,
}) {
    const isActive = pathname === item.path;

    return (
        <div
            className="rounded-full overflow-hidden transition-all duration-300 mx-1"
            style={{
                background: isActive ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                border: isActive ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid transparent',
            }}
        >
            <Link
                href={item.path}
                className={`flex items-center gap-3 px-4 py-2 text-xs font-light tracking-wider transition-colors duration-300 outline-none ${isActive ? 'text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
            >
                <item.icon
                    size={16}
                    strokeWidth={1.5}
                    className={`transition-colors duration-200 ${isActive ? 'text-white' : 'text-white/60'}`}
                />
                <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                    {item.name}
                </span>
            </Link>
        </div>
    );
}
