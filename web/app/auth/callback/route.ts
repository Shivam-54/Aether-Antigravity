import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const next = requestUrl.searchParams.get('next') || '/';

    if (code) {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        // Exchange the code for a session
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // Email verified successfully, redirect to home or dashboard
            return NextResponse.redirect(new URL('/', requestUrl.origin));
        }
    }

    // If there's an error or no code, redirect to an error page or home
    return NextResponse.redirect(new URL('/', requestUrl.origin));
}
