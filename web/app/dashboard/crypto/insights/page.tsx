'use client';

import AIInsights from '@/components/crypto/AIInsights';

export default function InsightsPage() {
    return (
        <div className="max-w-7xl mx-auto p-8 w-full space-y-8">
            <header>
                <h1 className="text-3xl font-light text-white tracking-tight">AI Insights</h1>
                <p className="text-sm text-white/40">Strategic awareness through intelligent analysis.</p>
            </header>

            <AIInsights />
        </div>
    );
}
