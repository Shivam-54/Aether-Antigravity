'use client';

import Sidebar from '@/components/layout/Sidebar';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import SourceNav from '@/components/layout/SourceNav';
import { SourceProvider } from '@/context/SourceContext';
import { RealEstateProvider } from '@/context/RealEstateContext';
import { SharesProvider } from '@/context/SharesContext';
import { BondsProvider } from '@/context/BondsContext';
import { CryptoProvider } from '@/context/CryptoContext';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [userName, setUserName] = useState<string>('User');
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        async function loadProfile() {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                // Middleware handles the security check. 
                // Checks here caused a redirect loop because client-side auth state 
                // wasn't syncing instantly with the server-side HttpOnly cookie.
                if (!session) {
                    console.log('No client session found yet - relying on Middleware protection');
                    return;
                }

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', session.user.id)
                    .single();

                if (profile?.full_name) {
                    setUserName(profile.full_name);
                }
            } catch (error) {
                console.error('Error loading profile:', error);
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, [supabase, router]);

    // Non-blocking profile load
    if (loading) {
        // Optional: We can return the dashboard with a loading skeleton, 
        // but for now let's just render the children so the user isn't stuck.
        // The 'Loading Aether...' screen was causing an infinite wait if getSession hangs.
    }

    return (
        <SourceProvider>
            <RealEstateProvider>
                <SharesProvider>
                    <BondsProvider>
                        <CryptoProvider>
                            <div className="min-h-screen bg-[#0a0a0a] text-white relative flex font-sans selection:bg-white/20">
                                {/* 
                                  STATIC BACKGROUND SYSTEM (Matched to Landing Page)
                                   - Monochrome, deep, crisp.
                                   - Replaces colored blobs to ensure glass borders pop exactly like the landing page.
                                */}
                                <div className="fixed inset-0 z-0 bg-[#0a0a0a] pointer-events-none">
                                    {/* Subtle radial glow for depth - Extended/Lightened */}
                                    <div
                                        className="absolute inset-0"
                                        style={{
                                            background: 'radial-gradient(circle at 50% -20%, #151515 0%, #0a0a0a 100%)'
                                        }}
                                    />
                                    {/* Optional: Subtle Grain Overlay for texture */}
                                    <div
                                        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
                                        style={{
                                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                                        }}
                                    />
                                </div>

                                {/* Glass Sidebar */}
                                <Sidebar />

                                <main className="flex-1 min-h-screen relative flex flex-col ml-48">
                                    {/* Source Navigation (Projected Context) */}
                                    <SourceNav />

                                    <div className="flex-grow flex items-center justify-center pt-24">
                                        {children}
                                    </div>
                                </main>
                            </div>
                        </CryptoProvider>
                    </BondsProvider>
                </SharesProvider>
            </RealEstateProvider>
        </SourceProvider>
    );
}
