'use client';

import { useSource } from '@/context/SourceContext';
import AIInsights from '@/components/realestate/AIInsights';
import AIAssistant from '@/components/realestate/AIAssistant';
import SharesAI from '@/components/shares/SharesAI';
import BondsAIInsights from '@/components/bonds/BondsAIInsights';
import { mockAIInsights } from '@/lib/mockData/realEstateData';
import { mockShareAIInsights } from '@/lib/mockData/sharesData';

export default function AIInsightsPage() {
    const { activeSource } = useSource();

    // Render different content based on active source
    const renderContent = () => {
        switch (activeSource) {
            case 'Real Estate':
                return (
                    <div className="w-full h-full overflow-y-auto px-12 py-8">
                        <div className="max-w-[1600px] mx-auto">
                            {/* AI Insights & Assistant */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <AIInsights insights={mockAIInsights} />
                                <AIAssistant />
                            </div>
                        </div>
                    </div>
                );

            case 'Crypto':
                return (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-white/50 text-lg font-light tracking-wide">
                            Crypto AI Insights coming soon...
                        </p>
                    </div>
                );

            case 'Shares':
                return (
                    <div className="w-full h-full overflow-y-auto px-12 py-8">
                        <div className="max-w-[1600px] mx-auto">
                            {/* AI Insights for Shares */}
                            <SharesAI insights={mockShareAIInsights} />
                        </div>
                    </div>
                );

            case 'Bonds':
                return (
                    <div className="w-full h-full overflow-y-auto px-12 py-8">
                        <div className="max-w-[1600px] mx-auto">
                            <BondsAIInsights />
                        </div>
                    </div>
                );

            case 'Business':
                return (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-white/50 text-lg font-light tracking-wide">
                            Business AI Insights coming soon...
                        </p>
                    </div>
                );

            case 'Home':
            default:
                return (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center space-y-4">
                            <h1 className="text-2xl font-light text-white/90 tracking-wide">
                                AI Insights
                            </h1>
                            <p className="text-white/50 text-lg font-light tracking-wide">
                                Select a source to view AI-powered insights
                            </p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="flex-1 h-full w-full">
            {renderContent()}
        </div>
    );
}
