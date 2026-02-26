import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const WORKSPACE_LIMITS = {
    free: 1,
    pro: 5,
    master: 99999
};

export async function GET() {
    try {
        let supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        let userId = user?.id;

        if (!userId) {
            if (process.env.NODE_ENV === 'development') {
                userId = 'ea333780-a920-420d-a6c7-ccc7c04a5ae0';
                supabase = createAdminClient();
            } else {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
        }

        const { data: workspaces, error } = await supabase
            .from('workspaces')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return NextResponse.json(workspaces);
    } catch (err: unknown) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        let supabase = await createClient();
        const adminSupabase = createAdminClient();
        const { data: { user } } = await supabase.auth.getUser();
        let userId = user?.id;

        if (!userId) {
            if (process.env.NODE_ENV === 'development') {
                userId = 'ea333780-a920-420d-a6c7-ccc7c04a5ae0';
                supabase = adminSupabase;
            } else {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
        }

        // Get limits based on tier
        const { data: profile } = await adminSupabase
            .from('users')
            .select('subscription_tier')
            .eq('id', userId)
            .single();

        const tier = (profile?.subscription_tier as keyof typeof WORKSPACE_LIMITS) || 'free';
        const limit = WORKSPACE_LIMITS[tier] || WORKSPACE_LIMITS.free;

        // Count existing
        const { count, error: countErr } = await supabase
            .from('workspaces')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        if (countErr) throw countErr;

        if ((count || 0) >= limit) {
            return NextResponse.json({ error: `You have reached your limit of ${limit} active book projects for the ${tier} tier.` }, { status: 403 });
        }

        const body = await req.json();
        const name = body.name || 'Untitled Project';
        const genre = body.genre || 'General Fiction';

        const { data: newWorkspace, error: createError } = await supabase
            .from('workspaces')
            .insert({
                user_id: userId,
                name,
                genre
            })
            .select()
            .single();

        if (createError) throw createError;
        return NextResponse.json(newWorkspace);
    } catch (err: unknown) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        let supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        let userId = user?.id;

        if (!userId) {
            if (process.env.NODE_ENV === 'development') {
                userId = 'ea333780-a920-420d-a6c7-ccc7c04a5ae0';
                supabase = createAdminClient();
            } else {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
        }

        const { searchParams } = new URL(req.url);
        const workspaceId = searchParams.get('workspaceId');

        if (!workspaceId) {
            return NextResponse.json({ error: 'workspaceId required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('workspaces')
            .delete()
            .eq('id', workspaceId)
            .eq('user_id', userId);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
