import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        const { email, password, full_name, tier } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        // We use AdminClient since RLS blocks standard users from inserting into public.users,
        // and we want to auto-confirm their email immediately.
        const adminSupabase = createAdminClient();

        // 1. Create user via Admin API (auto-confirms email)
        const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                full_name: full_name || '',
                tier: tier || 'free'
            }
        });

        if (authError) {
            return NextResponse.json({ error: authError.message }, { status: 400 });
        }

        if (!authData.user) {
            return NextResponse.json({ error: 'Failed to create user record in Auth' }, { status: 400 });
        }

        // 2. Ensure public.users has a mirror record.
        const { error: insertError } = await adminSupabase
            .from('users')
            .upsert({
                id: authData.user.id,
                email: email,
                full_name: full_name || 'Versana Author',
                subscription_tier: tier || 'free'
            });

        if (insertError) {
            console.error('Failed to insert into public.users:', insertError);
        }

        return NextResponse.json({ success: true, user: authData.user });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        console.error('Signup Error:', err);
        return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
    }
}
