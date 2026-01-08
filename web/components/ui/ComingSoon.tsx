'use client';

import { Construction } from 'lucide-react';

interface ComingSoonProps {
    title: string;
    description?: string;
    icon?: React.ElementType;
}

export default function ComingSoon({
    title,
    description = "This feature is currently under development. Stay tuned!",
    icon: Icon = Construction
}: ComingSoonProps) {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full p-8 text-center animate-in fade-in zoom-in duration-500">
            {/* Glass Card */}
            <div
                className="relative p-12 rounded-3xl overflow-hidden group"
                style={{
                    background: 'rgba(245, 235, 211, 0.01)',
                    border: '1px solid rgba(245, 235, 211, 0.1)',
                    boxShadow: '0 0 50px 0 rgba(245, 235, 211, 0.05), inset 0 0 20px 0 rgba(245, 235, 211, 0.02)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                }}
            >
                {/* Hover Noise Texture */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out z-0 mix-blend-overlay"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                        opacity: 0.06
                    }}
                />

                <div className="relative z-10 flex flex-col items-center gap-6">
                    {/* Icon Container with Glow */}
                    <div
                        className="p-6 rounded-full"
                        style={{
                            background: 'rgba(245, 235, 211, 0.03)',
                            border: '1px solid rgba(245, 235, 211, 0.15)',
                            boxShadow: '0 0 30px 0 rgba(245, 235, 211, 0.05)',
                        }}
                    >
                        <Icon strokeWidth={1.5} className="w-12 h-12 text-[#f5ebd3]/80" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-light tracking-widest text-[#f5ebd3]">
                            {title}
                        </h2>
                        <p className="text-[#f5ebd3]/50 font-light tracking-wide max-w-sm">
                            {description}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
