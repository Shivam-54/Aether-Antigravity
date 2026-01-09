'use client';

import { BondsProvider } from '@/context/BondsContext';

export default function BondsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <BondsProvider>{children}</BondsProvider>;
}
