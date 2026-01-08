import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Create Supabase client
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        // Resend verification email
        const { data, error } = await supabase.auth.resend({
            type: 'signup',
            email: email,
        });

        if (error) {
            console.error('Resend verification error:', error);
            return NextResponse.json(
                { error: error.message || 'Failed to resend verification email' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Verification email sent! Please check your inbox.',
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Resend verification error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
