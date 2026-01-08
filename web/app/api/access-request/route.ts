import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { fullName, email, age, countryCode, contactNumber, authKeyType, authKey } = body;

        // Validate required fields
        if (!fullName || !email || !authKey) {
            return NextResponse.json(
                { error: 'Full name, email, and authentication key are required' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Create Supabase client
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        // Sign up user with Supabase Auth
        // The password is the authKey they provided
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: authKey,
            options: {
                data: {
                    full_name: fullName,
                    age: age ? parseInt(age) : null,
                    country_code: countryCode || '+91',
                    phone: contactNumber || null,
                },
                emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
            },
        });

        if (error) {
            console.error('Supabase Auth error:', error);

            // Handle specific error cases
            if (error.message.includes('already registered')) {
                return NextResponse.json(
                    { error: 'This email is already registered. Please login instead.' },
                    { status: 400 }
                );
            }

            if (error.message.includes('Password should be')) {
                return NextResponse.json(
                    { error: 'Authentication key must be at least 6 characters long.' },
                    { status: 400 }
                );
            }

            return NextResponse.json(
                { error: error.message || 'Failed to create account' },
                { status: 500 }
            );
        }

        // Check if email confirmation is required
        if (data.user && !data.session) {
            // Email confirmation required
            return NextResponse.json(
                {
                    success: true,
                    message: 'Verification email sent! Please check your inbox to activate your account.',
                    requiresEmailVerification: true,
                    user: {
                        id: data.user.id,
                        email: data.user.email
                    }
                },
                { status: 200 }
            );
        }

        // Auto-confirmed (if email confirmation is disabled)
        return NextResponse.json(
            {
                success: true,
                message: 'Account created successfully!',
                requiresEmailVerification: false,
                user: {
                    id: data.user?.id,
                    email: data.user?.email
                }
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
