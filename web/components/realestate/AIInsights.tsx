'use client';

import { AIInsight } from '@/types/realestate';
import { Sparkles, TrendingUp, AlertTriangle, Target, Lightbulb } from 'lucide-react';
import { useRealEstate } from '@/context/RealEstateContext';

export default function AIInsights() {
    const { insights } = useRealEstate();

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case 'High':
                return 'text-red-400/80 bg-red-400/10';
            case 'Medium':
                return 'text-yellow-400/80 bg-yellow-400/10';
            case 'Low':
                return 'text-blue-400/80 bg-blue-400/10';
            default:
                return 'text-white/60 bg-white/10';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'risk':
                return AlertTriangle;
            case 'opportunity':
                return TrendingUp;
            case 'optimization':
                return Lightbulb;
            default:
                return Sparkles;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Sparkles size={24} strokeWidth={1.5} className="text-white/70" />
                <div>
                    <h2 className="text-2xl font-light tracking-wider text-white/90">
                        AI Property Insights
                    </h2>
                    <p className="text-sm font-light tracking-wide text-white/50">
                        Strategic recommendations powered by AI
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                {insights.length === 0 ? (
                    <div className="relative p-8 rounded-2xl text-center" style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}>
                        <Sparkles size={48} strokeWidth={1} className="text-white/20 mx-auto mb-4" />
                        <h3 className="text-lg font-light text-white/60 mb-2">Start Building Your Portfolio</h3>
                        <p className="text-sm font-light text-white/40">
                            Add properties to receive AI-powered insights on occupancy rates, rental yields, geographic diversification, and investment opportunities.
                        </p>
                    </div>
                ) : (
                    insights.map((insight) => {
                        const CategoryIcon = getCategoryIcon(insight.category);
                        const impactColorClass = getImpactColor(insight.impact);

                        return (
                            <div
                                key={insight.id}
                                className="relative p-6 rounded-2xl overflow-hidden group transition-all duration-300"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    boxShadow: '0 0 30px 0 rgba(255, 255, 255, 0.05)',
                                    backdropFilter: 'blur(10px)',
                                    WebkitBackdropFilter: 'blur(10px)',
                                }}
                            >
                                {/* Hover Texture */}
                                <div
                                    className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out z-0 mix-blend-overlay"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                                        opacity: 0.06
                                    }}
                                />

                                <div className="relative z-10 flex gap-4">
                                    {/* Icon */}
                                    <div className="flex-shrink-0 p-3 rounded-xl bg-white/5">
                                        <CategoryIcon size={20} strokeWidth={1.5} className="text-white/70" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 space-y-3">
                                        <p className="text-sm font-light tracking-wide text-white/90 leading-relaxed">
                                            {insight.message}
                                        </p>

                                        <div className="flex items-center gap-3">
                                            {/* Impact Badge */}
                                            <span className={`text-xs px-3 py-1 rounded-full font-light tracking-wider ${impactColorClass}`}>
                                                {insight.impact} Impact
                                            </span>

                                            {/* Confidence Indicator */}
                                            <div className="flex items-center gap-2">
                                                <div className="relative w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                    <div
                                                        className="absolute top-0 left-0 h-full bg-white/40 rounded-full transition-all duration-300"
                                                        style={{ width: `${insight.confidence}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-light text-white/50">
                                                    {insight.confidence}% confidence
                                                </span>
                                            </div>

                                            {/* Category */}
                                            <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-white/50 font-light tracking-wider capitalize">
                                                {insight.category}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
