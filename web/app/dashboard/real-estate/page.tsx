'use client';

import { useEffect } from 'react';
import { useSource } from '@/context/SourceContext';
import PortfolioOverview from '@/components/realestate/PortfolioOverview';
import PropertiesList from '@/components/realestate/PropertiesList';
import TransactionHistory from '@/components/realestate/TransactionHistory';
import DocumentsSection from '@/components/realestate/DocumentsSection';
import AIInsights from '@/components/realestate/AIInsights';
import AIAssistant from '@/components/realestate/AIAssistant';
import { mockPerformanceData } from '@/lib/mockData/realEstateData';

export default function RealEstatePage() {
    const { setActiveSource } = useSource();

    useEffect(() => {
        setActiveSource('Real Estate');
    }, [setActiveSource]);

    return (
        <div className="w-full max-w-7xl mx-auto px-8 py-12 space-y-16">
            {/* Section 1: Portfolio Overview & Performance */}
            <section>
                <PortfolioOverview performanceData={mockPerformanceData} />
            </section>

            {/* Section 2: Properties (Core Inventory) */}
            <section>
                <PropertiesList />
            </section>

            {/* Section 3: Rental & Sale History */}
            <section>
                <TransactionHistory />
            </section>

            {/* Section 4: Valuations & Documents */}
            <section>
                <DocumentsSection />
            </section>

            {/* Section 5: AI Insights & Assistant */}
            <section className="space-y-12">
                <AIInsights />
                <AIAssistant />
            </section>
        </div>
    );
}
