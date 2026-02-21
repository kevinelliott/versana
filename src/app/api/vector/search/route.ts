import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();

        // Auth Check
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return new Response('Unauthorized', { status: 401 });
        }

        const { queryEmbedding, workspaceId, matchThreshold = 0.75, matchCount = 5 } = await req.json();

        if (!workspaceId || !queryEmbedding) {
            return new Response('Workspace ID and query embedding required', { status: 400 });
        }

        // Call the postgres RPC strictly scoped by workspaceId
        const { data: documents, error } = await supabase.rpc('match_context_embeddings', {
            query_embedding: queryEmbedding,
            target_workspace_id: workspaceId,
            match_threshold: matchThreshold,
            match_count: matchCount,
        });

        if (error) {
            console.error('pgvector RPC error:', error);
            return new Response('Database Error', { status: 500 });
        }

        return Response.json({ documents });
    } catch (error) {
        console.error('Vector Search API Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
