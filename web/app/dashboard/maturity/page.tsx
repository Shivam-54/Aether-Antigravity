'use client';

import BondMaturitySchedule from '@/components/bonds/BondMaturitySchedule';
import { mockBonds } from '@/lib/mockData/bondsData';

export default function MaturityPage() {
    return (
        <div className="w-full h-full overflow-y-auto px-12 py-8">
            <div className="max-w-[1600px] mx-auto">
                <BondMaturitySchedule bonds={mockBonds} />
            </div>
        </div>
    );
}
