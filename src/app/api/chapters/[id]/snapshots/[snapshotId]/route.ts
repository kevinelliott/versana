import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(req: Request, props: { params: Promise<{ id: string, snapshotId: string }> }) {
    try {
        const params = await props.params;
        const snapshotId = params.snapshotId;
        
        let supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user && process.env.NODE_ENV === 'development') {
            supabase = createAdminClient();
        } else if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data, error } = await supabase
            .from('chapter_snapshots')
            .select('*')
            .eq('id', snapshotId)
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (err: unknown) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
