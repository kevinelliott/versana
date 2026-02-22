import { openai } from '@ai-sdk/openai';
import { embed } from 'ai';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return new Response('Unauthorized', { status: 401 });
        }

        const { text, workspaceId, metadata = {} } = await req.json();

        if (!text || !workspaceId) {
            return new Response('Missing required fields: text and workspaceId', { status: 400 });
        }

        // Generate embedding using OpenAI's small-embedding model (optimized for retrieval)
        const { embedding, usage } = await embed({
            model: openai.embedding('text-embedding-3-small'),
            value: text,
        });

        // Store the vector inside Supabase pgvector table
        const { data: insertedData, error: dbError } = await supabase
            .from('context_embeddings')
            .insert({
                user_id: user.id,
                workspace_id: workspaceId,
                content: text,
                embedding: embedding,
                metadata: metadata
            })
            .select()
            .single();

        if (dbError) {
            console.error('Database insertion error:', dbError);
            return new Response('Failed to save to Context Matrix', { status: 500 });
        }

        // TODO: Map usage (tokens) to api_usage_logs for Admin Dashboard tracking

        return Response.json({ success: true, data: insertedData, usage });
    } catch (error) {
        console.error('Vector Insert API Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
