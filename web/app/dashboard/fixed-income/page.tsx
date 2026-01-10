'use client';

import { useEffect } from 'react';
import { useSource } from '@/context/SourceContext';
import { useBonds } from '@/context/BondsContext';
import BondFixedIncome from '@/components/bonds/BondFixedIncome';

export default function FixedIncomePage() {
    const { setActiveSource } = useSource();
    const { bonds, loading } = useBonds();

    useEffect(() => {
        setActiveSource('Bonds');
    }, [setActiveSource]);

    if (loading) {
        return <div className="p-8 text-white/50">Loading bonds data...</div>;
    }

    return (
        <div className="w-full h-full overflow-y-auto px-12 py-8">
            <div className="max-w-[1600px] mx-auto">
                <BondFixedIncome bonds={bonds} />
            </div>
        </div>
    );
}
