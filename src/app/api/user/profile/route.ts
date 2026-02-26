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

        // Mock current tokens for visual tracking
        const tokens_used = profile.subscription_tier === 'pro' ? 450000 : profile.subscription_tier === 'master' ? 1200000 : 38000;

        return NextResponse.json({
            ...profile,
            tokens_used
        });

    } catch (err: unknown) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
