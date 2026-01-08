'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface TopHeaderProps {
    userName: string;
}

export default function TopHeader({ userName }: TopHeaderProps) {
    const pathname = usePathname();

    return (
        <header className="fixed top-0 left-16 right-0 h-16 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 flex items-center px-8 z-40">
            {/* User Greeting */}
            <div className="flex items-center gap-3 min-w-fit">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-medium text-white ring-2 ring-black">
                    {userName.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h2 className="text-sm font-medium text-white tracking-wide">{userName}</h2>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest">Wealth Manager</p>
                </div>
            </div>

            {/* Right Actions (Optional - e.g. Notifications) */}
            <div className="ml-auto flex items-center gap-4">
                <button className="relative p-2 text-white/40 hover:text-white transition-colors">
                    <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                    </svg>
                </button>
            </div>
        </header>
    );
}
