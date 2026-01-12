'use client';

import { useSource } from '@/context/SourceContext';
import { useEffect } from 'react';

// Real Estate Components
import PortfolioOverview from '@/components/realestate/PortfolioOverview';

// Shares Components
import SharesDashboard from '@/components/shares/SharesDashboard';

import CryptoDashboard from '@/components/crypto/CryptoDashboard';

// Bonds Components
import BondsDashboard from '@/components/bonds/BondsDashboard';

// Business Components
import BusinessDashboard from '@/components/business/BusinessDashboard';

// Mock Data
import {
    mockPerformanceData,
    mockProperties,
} from '@/lib/mockData/realEstateData';



import { mockBonds, mockBondMetrics } from '@/lib/mockData/bondsData';

export default function DashboardPage() {
    const { activeSource, setActiveSource } = useSource();

    // Set initial source to Home if none selected
    useEffect(() => {
        if (!activeSource) {
            setActiveSource('Home');
        }
    }, [activeSource, setActiveSource]);

    // Render different content based on active source
    const renderContent = () => {
        switch (activeSource) {
            case 'Real Estate':
                return (
                    <div className="w-full h-full overflow-y-auto px-12 py-8">
                        <div className="max-w-[1600px] mx-auto">
                            {/* Portfolio Overview - Main Dashboard View */}
                            <PortfolioOverview performanceData={mockPerformanceData} />
                        </div>
                    </div>
                );

            case 'Crypto':
                return (
                    <div className="w-full h-full overflow-y-auto px-12 py-8">
                        <div className="max-w-[1600px] mx-auto">
                            <CryptoDashboard />
                        </div>
                    </div>
                );

            case 'Shares':
                return (
                    <div className="w-full h-full overflow-y-auto px-12 py-8">
                        <div className="max-w-[1600px] mx-auto">
                            {/* Shares Dashboard - Main Overview */}
                            <SharesDashboard />
                        </div>
                    </div>
                );

            case 'Bonds':
                return (
                    <div className="w-full h-full overflow-y-auto px-12 py-8">
                        <div className="max-w-[1600px] mx-auto">
                            <BondsDashboard />
                        </div>
                    </div>
                );

            case 'Business':
                return (
                    <div className="w-full h-full overflow-y-auto px-12 py-8">
                        <div className="max-w-[1600px] mx-auto">
                            <BusinessDashboard />
                        </div>
                    </div>
                );

            case 'Home':
            default:
                return (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center space-y-4">
                            <h1 className="text-4xl font-light text-white/90 tracking-wide">
                                Welcome to Aether
                            </h1>
                            <p className="text-white/50 text-lg font-light tracking-wide">
                                Select a source from the navigation above to begin
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
