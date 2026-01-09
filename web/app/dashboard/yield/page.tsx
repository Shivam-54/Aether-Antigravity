'use client';

import BondYieldAnalysis from '@/components/bonds/BondYieldAnalysis';
import { mockBonds } from '@/lib/mockData/bondsData';

export default function YieldPage() {
    return (
        <div className="w-full h-full overflow-y-auto px-12 py-8">
            <div className="max-w-[1600px] mx-auto">
                <BondYieldAnalysis bonds={mockBonds} />
            </div>
        </div>
    );
}
