'use client';

import BondAllocation from '@/components/bonds/BondAllocation';
import { mockBonds } from '@/lib/mockData/bondsData';

export default function AllocationPage() {
    return (
        <div className="w-full h-full overflow-y-auto px-12 py-8">
            <div className="max-w-[1600px] mx-auto">
                <BondAllocation bonds={mockBonds} />
            </div>
        </div>
    );
}
