import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const workspaceId = params.id;
        
        let supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user && process.env.NODE_ENV === 'development') {
            supabase = createAdminClient();
        } else if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data, error } = await supabase
            .from('workspace_members')
            .select(`
                id,
                role,
                users!inner (email)
            `)
            .eq('workspace_id', workspaceId)
            .order('created_at', { ascending: true });

        if (error) throw error;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formatted = data.map((row: any) => ({
            id: row.id,
            email: row.users.email,
            role: row.role
        }));

        return NextResponse.json(formatted);
    } catch (err: unknown) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const workspaceId = params.id;
        
        let supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user && process.env.NODE_ENV === 'development') {
            supabase = createAdminClient();
        } else if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { email, role } = body;

        if (!email) return NextResponse.json({ error: 'Email missing' }, { status: 400 });

        // Lookup user by email to get their user_id
        // Must use admin client to read users email table
        const adminSupabase = createAdminClient();
        const { data: targetUser, error: findErr } = await adminSupabase
            .from('users')
            .select('id, email')
            .eq('email', email)
            .single();

        if (findErr || !targetUser) {
            return NextResponse.json({ error: 'No user found with that email. They must secure an account first.' }, { status: 404 });
        }

        const { data, error } = await supabase
            .from('workspace_members')
            .insert({
                workspace_id: workspaceId,
                user_id: targetUser.id,
                role: role || 'viewer'
            })
            .select('id, role')
            .single();

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json({ error: 'User is already a member of this workspace.' }, { status: 409 });
            }
            throw error;
        }

        return NextResponse.json({
            id: data.id,
            email: targetUser.email,
            role: data.role
        });
    } catch (err: unknown) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
