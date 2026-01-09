'use client';

import { useEffect } from 'react';
import { useSource } from '@/context/SourceContext';
import { useBusiness } from '@/context/BusinessContext';
import { TrendingDown, TrendingUp, Lightbulb, AlertTriangle, Info } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AIInsightsPage() {
    const { setActiveSource } = useSource();
    const { aiInsights, businesses, loading } = useBusiness();

    useEffect(() => {
        setActiveSource('Business');
    }, [setActiveSource]);

    if (loading) {
        return <div className="p-8 text-white/50">Loading AI insights...</div>;
    }

    const sortedInsights = [...aiInsights].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return (
        <div className="max-w-7xl mx-auto p-8 w-full space-y-8">
            {/* Header */}
            <header>
                <h1 className="text-3xl font-light text-white tracking-tight">AI Insights</h1>
                <p className="text-sm text-white/40">Decision intelligence powered by your business data</p>
            </header>

            {/* Insight Feed */}
            <div className="space-y-4">
                {sortedInsights.map((insight) => (
                    <InsightCard key={insight.id} insight={insight} businesses={businesses} />
                ))}
            </div>

            {/* AI Chat Assistant */}
            <div className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-6">
                <h2 className="text-lg font-light text-white mb-6">AI Business Assistant</h2>

                {/* Chat Interface */}
                <div className="space-y-4">
                    {/* Empty State */}
                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 flex flex-col items-center justify-center min-h-[300px]">
                        <Lightbulb className="w-12 h-12 text-white/20 mb-4" />
                        <p className="text-white/40 text-sm mb-6 text-center max-w-md">
                            Ask me about your business performance, trends, or projections.
                        </p>

                        {/* Suggested Queries */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                            <SuggestedQuery text="Which business is most profitable?" />
                            <SuggestedQuery text="Why did profits drop last quarter?" />
                            <SuggestedQuery text="What happens if expenses increase by 10%?" />
                            <SuggestedQuery text="Show me cash flow trends" />
                        </div>
                    </div>

                    {/* Chat Input */}
                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 flex items-center gap-3">
                        <input
                            type="text"
                            placeholder="Ask about your businesses..."
                            className="flex-1 bg-transparent text-white placeholder:text-white/40 outline-none text-sm"
                            disabled
                        />
                        <button
                            disabled
                            className="px-4 py-2 rounded-full bg-white/5 text-white/40 text-sm cursor-not-allowed"
                        >
                            Send
                        </button>
                    </div>
                    <p className="text-white/30 text-xs text-center">
                        AI chat functionality coming soon...
                    </p>
                </div>
            </div>
        </div>
    );
}

function InsightCard({ insight, businesses }: { insight: any; businesses: any[] }) {
    const business = insight.businessId ? businesses.find((b) => b.id === insight.businessId) : null;

    const typeIcons = {
        'Expense Spike': TrendingUp,
        'Profit Trend': TrendingUp,
        'Cash Flow Risk': AlertTriangle,
        'Growth Opportunity': Lightbulb,
        'General': Info,
    };

    const severityColors = {
        'info': 'border-blue-500/20 bg-blue-500/5',
        'warning': 'border-yellow-500/20 bg-yellow-500/5',
        'critical': 'border-red-500/20 bg-red-500/5',
    };

    const iconColors = {
        'info': 'text-blue-400',
        'warning': 'text-yellow-400',
        'critical': 'text-red-400',
    };

    const Icon = typeIcons[insight.type as keyof typeof typeIcons] || Info;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl border backdrop-blur-sm p-6 ${severityColors[insight.severity]}`}
        >
            <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 ${iconColors[insight.severity]}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="text-white font-medium">{insight.title}</h3>
                        <span className="text-white/40 text-xs whitespace-nowrap">
                            {new Date(insight.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                            })}
                        </span>
                    </div>
                    <p className="text-white/60 text-sm mb-3">{insight.description}</p>
                    {business && (
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full bg-white/5 text-white/60 text-xs">
                                {business.name}
                            </span>
                            <span className="px-3 py-1 rounded-full bg-white/5 text-white/60 text-xs">
                                {insight.type}
                            </span>
                        </div>
                    )}
                    {!business && (
                        <span className="px-3 py-1 rounded-full bg-white/5 text-white/60 text-xs">
                            Portfolio-wide
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

function SuggestedQuery({ text }: { text: string }) {
    return (
        <button
            disabled
            className="px-4 py-3 rounded-xl border border-white/5 bg-white/[0.02] text-white/60 text-sm text-left hover:bg-white/[0.04] hover:text-white/80 transition-colors cursor-not-allowed"
        >
            {text}
        </button>
    );
}
