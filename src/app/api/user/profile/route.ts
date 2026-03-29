import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        let supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        let userId = user?.id;

        if (!userId) {
            if (process.env.NODE_ENV === 'development') {
                userId = 'ea333780-a920-420d-a6c7-ccc7c04a5ae0'; // Mock dev user
                supabase = createAdminClient();
            } else {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
        }

        const { data: profile, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error || !profile) {
            // Mock profile if it hasn't been created via triggers yet
            return NextResponse.json({
                id: userId,
                email: 'author@versana.app',
                full_name: 'Versana Author',
                subscription_tier: 'free',
                tokens_used: 14500
            });
        }

        // Check if mana_balance actually exists on the profile object (since we are unsure if the remote DB migration ran)
        const current_mana = profile.mana_balance ?? (profile.subscription_tier === 'pro' ? 450000 : profile.subscription_tier === 'master' ? 1200000 : 38000);

        return NextResponse.json({
            ...profile,
            tokens_used: current_mana, // Renamed tokens_used into current_mana for backwards compat with older components
            mana_balance: current_mana
        });

    } catch (err: unknown) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        let supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        let userId = user?.id;

        if (!userId) {
            if (process.env.NODE_ENV === 'development') {
                userId = 'ea333780-a920-420d-a6c7-ccc7c04a5ae0'; // Mock dev user
                supabase = createAdminClient();
            } else {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
        }

        const body = await req.json().catch(() => ({}));
        const { full_name } = body;

        if (!full_name || typeof full_name !== 'string' || full_name.trim().length === 0) {
            return NextResponse.json({ error: 'A valid full_name is required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('users')
            .update({ full_name: full_name.trim() })
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            // In dev mode, if user record doesn't exist, we might upsert it.
            if (process.env.NODE_ENV === 'development') {
                const adminDb = createAdminClient();
                const { data: upsertData, error: upsertError } = await adminDb
                    .from('users')
                    .upsert({ id: userId, email: 'author@versana.app', full_name: full_name.trim(), subscription_tier: 'free' })
                    .select()
                    .single();
                
                if (upsertError) throw upsertError;
                return NextResponse.json(upsertData);
            }
            throw error;
        }

        return NextResponse.json(data);

    } catch (err: unknown) {
        console.error("Profile update error", err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
