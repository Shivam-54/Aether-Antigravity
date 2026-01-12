'use client';

import { useEffect } from 'react';
import { useSource } from '@/context/SourceContext';
import BusinessDashboard from '@/components/business/BusinessDashboard';

export default function BusinessPage() {
    const { setActiveSource } = useSource();

    useEffect(() => {
        setActiveSource('Business');
    }, [setActiveSource]);

    return <BusinessDashboard />;
}
