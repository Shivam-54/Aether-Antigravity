'use client';

import { useSource } from '@/context/SourceContext';
import PropertiesList from '@/components/realestate/PropertiesList';
import SharesHoldings from '@/components/shares/SharesHoldings';
import { useShares } from '@/context/SharesContext';

export default function PortfolioPage() {
    const { activeSource } = useSource();
    const { shares } = useShares();

    // Render different content based on active source
    const renderContent = () => {
        switch (activeSource) {
            case 'Real Estate':
                return (
                    <div className="w-full h-full overflow-y-auto px-12 py-8">
                        <div className="max-w-[1600px] mx-auto">
                            {/* Properties List */}
                            <PropertiesList />
                        </div>
                    </div>
                );

            case 'Crypto':
                return (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-white/50 text-lg font-light tracking-wide">
                            Crypto Wallets coming soon...
                        </p>
                    </div>
                );

            case 'Shares':
                return (
                    <div className="w-full h-full overflow-y-auto px-12 py-8">
                        <div className="max-w-[1600px] mx-auto">
                            {/* Share Holdings */}
                            <SharesHoldings shares={shares} />
                        </div>
                    </div>
                );

            case 'Bonds':
                return (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-white/50 text-lg font-light tracking-wide">
                            Fixed Income Portfolio coming soon...
                        </p>
                    </div>
                );

            case 'Business':
                return (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-white/50 text-lg font-light tracking-wide">
                            Business Ventures coming soon...
                        </p>
                    </div>
                );

            case 'Home':
            default:
                return (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center space-y-4">
                            <h1 className="text-2xl font-light text-white/90 tracking-wide">
                                All Assets
                            </h1>
                            <p className="text-white/50 text-lg font-light tracking-wide">
                                Select a source to view specific assets
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
