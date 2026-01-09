'use client';

import { useSource } from '@/context/SourceContext';
import BondFixedIncome from '@/components/bonds/BondFixedIncome';
import { mockBonds } from '@/lib/mockData/bondsData';

export default function FixedIncomePage() {
    return (
        <div className="w-full h-full overflow-y-auto px-12 py-8">
            <div className="max-w-[1600px] mx-auto">
                <BondFixedIncome bonds={mockBonds} />
            </div>
        </div>
    );
}
