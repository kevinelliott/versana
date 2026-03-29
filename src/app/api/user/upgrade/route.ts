import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
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

        const body = await req.json();
        const tier = body.tier || 'pro'; // Default to pro if unspecified

        const { error } = await supabase
            .from('users')
            .update({ subscription_tier: tier })
            .eq('id', userId);

        if (error) throw error;

        return NextResponse.json({ success: true, tier });
    } catch (e: unknown) {
        console.error("Failed to upgrade subscription:", e);
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}
