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
            .from('document_comments')
            .select(`
                id,
                chapter_id,
                user_id,
                from_pos,
                to_pos,
                highlighted_text,
                comment_body,
                resolved,
                created_at,
                users (email)
            `)
            .eq('chapter_id', chapterId)
            .eq('resolved', false)
            .order('created_at', { ascending: true });

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
        
        let userId = user?.id;
        if (!userId && process.env.NODE_ENV === 'development') {
            userId = 'ea333780-a920-420d-a6c7-ccc7c04a5ae0';
            supabase = createAdminClient();
        } else if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { commentId, workspaceId, fromPos, toPos, highlightedText, commentBody } = body;

        // Insert comment
        const { data, error } = await supabase
            .from('document_comments')
            .insert({
                id: commentId || undefined,
                chapter_id: chapterId,
                workspace_id: workspaceId,
                user_id: userId,
                from_pos: fromPos || 0,
                to_pos: toPos || 0,
                highlighted_text: highlightedText || '',
                comment_body: commentBody || ''
            })
            .select(`
                id,
                chapter_id,
                user_id,
                from_pos,
                to_pos,
                highlighted_text,
                comment_body,
                resolved,
                created_at,
                users (email)
            `)
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (err: unknown) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        let supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user && process.env.NODE_ENV === 'development') {
            supabase = createAdminClient();
        } else if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { commentId, resolved } = body;

        const { data, error } = await supabase
            .from('document_comments')
            .update({ resolved })
            .eq('id', commentId)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (err: unknown) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
