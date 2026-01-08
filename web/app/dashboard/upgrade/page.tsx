'use client';

import ComingSoon from '@/components/ui/ComingSoon';
import { Crown } from 'lucide-react';

export default function UpgradePage() {
    return <ComingSoon title="Upgrade to Premium" description="Unlock exclusive features and limits with Aether Premium." icon={Crown} />;
}
