import { createClient, createAdminClient } from '@/lib/supabase/server';

// Fetch all chapters for a given workspace
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const workspaceId = searchParams.get('workspaceId');

        if (!workspaceId) {
            return new Response('Workspace ID required', { status: 400 });
        }

        let supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();
        let userId = user?.id;

        if (!userId) {
            if (process.env.NODE_ENV === 'development') {
                userId = 'ea333780-a920-420d-a6c7-ccc7c04a5ae0'; // Mock dev user
                supabase = createAdminClient();
            } else {
                return new Response('Unauthorized', { status: 401 });
            }
        }

        const { data: chapters, error } = await supabase
            .from('chapters')
            .select('id, title, order_index, updated_at')
            .eq('workspace_id', workspaceId)
            .order('order_index', { ascending: true });

        if (error) throw error;

        return Response.json(chapters);
    } catch (error) {
        console.error('Fetch Chapters API Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}

// Create a new chapter
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
                return new Response('Unauthorized', { status: 401 });
            }
        }

        const { workspaceId, title, orderIndex } = await req.json();

        if (!workspaceId || !title) {
            return new Response('Workspace ID and Title required', { status: 400 });
        }

        const { data: chapter, error } = await supabase
            .from('chapters')
            .insert({
                workspace_id: workspaceId,
                title,
                order_index: orderIndex || 0,
                content: { type: "doc", content: [] } // Empty TipTap doc
            })
            .select()
            .single();

        if (error) throw error;

        return Response.json(chapter);
    } catch (error) {
        console.error('Create Chapter API Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
