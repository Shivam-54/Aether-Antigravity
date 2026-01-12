'use client';

import { useSource } from '@/context/SourceContext';
import DocumentsSection from '@/components/realestate/DocumentsSection';
import SharesPerformance from '@/components/shares/SharesPerformance';
import { mockDocuments } from '@/lib/mockData/realEstateData';

export default function ReportsPage() {
    const { activeSource } = useSource();

    // Render different content based on active source
    const renderContent = () => {
        switch (activeSource) {
            case 'Real Estate':
                return (
                    <div className="w-full h-full overflow-y-auto px-12 py-8">
                        <div className="max-w-[1600px] mx-auto">
                            {/* Valuations & Documents */}
                            <DocumentsSection documents={mockDocuments} />
                        </div>
                    </div>
                );

            case 'Crypto':
                return (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-white/50 text-lg font-light tracking-wide">
                            Crypto Holdings Reports coming soon...
                        </p>
                    </div>
                );

            case 'Shares':
                return (
                    <div className="w-full h-full overflow-y-auto px-12 py-8">
                        <div className="max-w-[1600px] mx-auto">
                            {/* Performance Report */}
                            <SharesPerformance />
                        </div>
                    </div>
                );

            case 'Bonds':
                return (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-white/50 text-lg font-light tracking-wide">
                            Maturity Schedule coming soon...
                        </p>
                    </div>
                );

            case 'Business':
                return (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-white/50 text-lg font-light tracking-wide">
                            Financial Statements coming soon...
                        </p>
                    </div>
                );

            case 'Home':
            default:
                return (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center space-y-4">
                            <h1 className="text-2xl font-light text-white/90 tracking-wide">
                                System Reports
                            </h1>
                            <p className="text-white/50 text-lg font-light tracking-wide">
                                Select a source to view specific reports
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
