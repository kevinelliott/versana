import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const chapterId = params.id;
        
        let supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user && process.env.NODE_ENV === 'development') {
            supabase = createAdminClient();
        } else if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data, error } = await supabase
            .from('chapter_snapshots')
            .select('id, created_at, snapshot_note')
            .eq('chapter_id', chapterId)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) throw error;
        return NextResponse.json(data);
    } catch (err: unknown) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const chapterId = params.id;
        
        let supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user && process.env.NODE_ENV === 'development') {
            supabase = createAdminClient();
        } else if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { note, content } = body;

        // Fetch the workspace_id for this chapter
        const { data: chap, error: chapErr } = await supabase
            .from('chapters')
            .select('workspace_id, yjs_state')
            .eq('id', chapterId)
            .single();

        if (chapErr || !chap) {
            return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
        }

        // Insert snapshot
        const { data, error } = await supabase
            .from('chapter_snapshots')
            .insert({
                chapter_id: chapterId,
                workspace_id: chap.workspace_id,
                snapshot_note: note || 'Auto-save snapshot',
                content: content,
                yjs_state: chap.yjs_state // Backup the current binary stream
            })
            .select('id, created_at, snapshot_note')
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (err: unknown) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
