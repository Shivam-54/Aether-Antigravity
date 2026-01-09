'use client';

import { SharesProvider } from '@/context/SharesContext';

export default function SharesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <SharesProvider>{children}</SharesProvider>;
}
