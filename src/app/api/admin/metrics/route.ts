import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = createAdminClient();

        const [
            { count: usersCount },
            { count: workspacesCount },
            { count: chaptersCount }
        ] = await Promise.all([
            supabase.from('users').select('*', { count: 'exact', head: true }),
            supabase.from('workspaces').select('*', { count: 'exact', head: true }),
            supabase.from('chapters').select('*', { count: 'exact', head: true })
        ]);

        return NextResponse.json({
            users: usersCount || 0,
            workspaces: workspacesCount || 0,
            chapters: chaptersCount || 0
        });
    } catch (err: unknown) {
        console.error('Admin Metrics API error:', err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
