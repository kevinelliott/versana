import { openai } from '@ai-sdk/openai';
import { embed } from 'ai';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { checkTokenQuota } from '@/lib/quota';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return new Response('Unauthorized', { status: 401 });
        }

        const quota = await checkTokenQuota(user.id);
        if (!quota.allowed) {
            return new Response('Monthly token quota exceeded. Please upgrade your tier.', { status: 429 });
        }

        const { text, workspaceId, metadata = {} } = await req.json();

        if (!text || !workspaceId) {
            return new Response('Missing required fields: text and workspaceId', { status: 400 });
        }

        // Default mock embedding fallback
        let embedding: number[] = Array(1536).fill(0.01);
        let usageTokens = 0;

        if (process.env.OPENAI_API_KEY) {
            const result = await embed({
                model: openai.embedding('text-embedding-3-small'),
                value: text,
            });
            embedding = result.embedding;
            usageTokens = result.usage.tokens;
        }

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

        if (usageTokens > 0) {
            try {
                const adminSupabase = createAdminClient();
                await adminSupabase.from('api_usage_logs').insert({
                    user_id: user.id,
                    workspace_id: workspaceId,
                    model_name: 'text-embedding-3-small',
                    tokens_used: usageTokens,
                    cost_usd: usageTokens * 0.02 / 1000000 // $0.02 per 1M tokens
                });
            } catch (err) {
                console.error("Failed to log vector embedding usage:", err);
            }
        }

        return Response.json({ success: true, data: insertedData, usageTokens });
    } catch (error) {
        console.error('Vector Insert API Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
