import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, authKey } = body;

        if (!email || !authKey) {
            return NextResponse.json(
                { error: 'Email and authentication key are required' },
                { status: 400 }
            );
        }

        // Create Supabase client (Server-Side with Cookies)
        const supabase = await createClient();

        // Sign in with email and password
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password: authKey, // Using authKey as password
        });

        if (error) {
            console.error('Login error:', error);

            // More helpful error messages
            if (error.message.includes('Invalid login credentials')) {
                return NextResponse.json(
                    { error: 'Invalid email or authentication key. Please try again.' },
                    { status: 401 }
                );
            }

            return NextResponse.json(
                { error: error.message || 'Login failed' },
                { status: 401 }
            );
        }

        // Check if email is verified
        if (data.user && !data.user.email_confirmed_at) {
            return NextResponse.json(
                {
                    error: 'Please verify your email first. Check your inbox for the verification link.',
                    requiresEmailVerification: true,
                    userEmail: data.user.email
                },
                { status: 403 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Login successful!',
                user: {
                    id: data.user?.id,
                    email: data.user?.email,
                    emailVerified: !!data.user?.email_confirmed_at
                },
                session: {
                    access_token: data.session?.access_token
                }
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
