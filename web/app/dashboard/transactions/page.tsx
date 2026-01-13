'use client';

import { useSource } from '@/context/SourceContext';
import TransactionHistory from '@/components/realestate/TransactionHistory';
import SharesTransactions from '@/components/shares/SharesTransactions';

export default function TransactionsPage() {
    const { activeSource } = useSource();

    // Render different content based on active source
    const renderContent = () => {
        switch (activeSource) {
            case 'Real Estate':
                return (
                    <div className="w-full h-full overflow-y-auto px-12 py-8">
                        <div className="max-w-[1600px] mx-auto">
                            {/* Rental & Sale History */}
                            <TransactionHistory />
                        </div>
                    </div>
                );

            case 'Crypto':
                return (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-white/50 text-lg font-light tracking-wide">
                            On-chain Activity coming soon...
                        </p>
                    </div>
                );

            case 'Shares':
                return (
                    <div className="w-full h-full overflow-y-auto px-12 py-8">
                        <div className="max-w-[1600px] mx-auto">
                            {/* Market Activity */}
                            <SharesTransactions />
                        </div>
                    </div>
                );

            case 'Bonds':
                return (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-white/50 text-lg font-light tracking-wide">
                            Yield Analysis coming soon...
                        </p>
                    </div>
                );

            case 'Business':
                return (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-white/50 text-lg font-light tracking-wide">
                            Cash Flow coming soon...
                        </p>
                    </div>
                );

            case 'Home':
            default:
                return (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center space-y-4">
                            <h1 className="text-2xl font-light text-white/90 tracking-wide">
                                Global Activity
                            </h1>
                            <p className="text-white/50 text-lg font-light tracking-wide">
                                Select a source to view specific transactions
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
