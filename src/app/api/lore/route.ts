import { createClient, createAdminClient } from '@/lib/supabase/server';
import { openai } from '@ai-sdk/openai';
import { embed } from 'ai';

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

        const { data: lore, error } = await supabase
            .from('lore_entries')
            .select('id, entity_name, aliases, entity_type, synopsis, status')
            .eq('workspace_id', workspaceId);

        if (error) throw error;

        // Format to match the frontend LORE_DATABASE structure
        const formattedLore = (lore || []).map(e => ({
            id: e.id,
            name: e.entity_name,
            aliases: e.aliases || [],
            type: e.entity_type,
            synopsis: e.synopsis,
            status: e.status
        }));

        return Response.json(formattedLore);
    } catch (error) {
        console.error('Fetch Lore API Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}

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

        const body = await req.json();
        const { workspaceId, name, type, synopsis } = body;

        if (!workspaceId || !name || !type) {
            return new Response('Missing required fields', { status: 400 });
        }

        const { data: workspace } = await supabase
            .from('workspaces')
            .select('id')
            .eq('id', workspaceId)
            .eq('user_id', userId)
            .single();

        if (!workspace && process.env.NODE_ENV !== 'development') {
            return new Response('Workspace not found or unauthorized', { status: 404 });
        }

        const { data: newEntry, error } = await supabase
            .from('lore_entries')
            .insert({
                workspace_id: workspaceId,
                entity_name: name,
                entity_type: type,
                synopsis: synopsis,
                status: 'Active'
            })
            .select('*')
            .single();

        if (error) {
            console.error("Supabase insert error:", error);
            throw error;
        }

        // Generate embedding and save to context_embeddings
        try {
            let embedding: number[] = Array(1536).fill(0.01);
            let usageTokens = 0;

            if (process.env.OPENAI_API_KEY) {
                const result = await embed({
                    model: openai.embedding('text-embedding-3-small'),
                    value: `Lore Entry: ${name}. Type: ${type}. Synopsis: ${synopsis}`,
                });
                embedding = result.embedding;
                usageTokens = result.usage.tokens;
            }

            const { error: dbError } = await supabase
                .from('context_embeddings')
                .insert({
                    user_id: userId,
                    workspace_id: workspaceId,
                    content: `[LORE: ${name} (${type})] ${synopsis}`,
                    embedding: embedding,
                    metadata: { type: 'lore', entityId: newEntry.id, entityName: name }
                });

            if (dbError) {
                console.error('Context Matrix Embedding Insert Error:', dbError);
            } else if (usageTokens > 0) {
                const adminSupabase = createAdminClient();
                await adminSupabase.from('api_usage_logs').insert({
                    user_id: userId,
                    workspace_id: workspaceId,
                    model_name: 'text-embedding-3-small',
                    tokens_used: usageTokens,
                    cost_usd: usageTokens * 0.02 / 1000000
                });
            }
        } catch (embeddingError) {
            console.error('Failed to generate embedding for lore:', embeddingError);
        }

        return Response.json({
            id: newEntry.id,
            name: newEntry.entity_name,
            aliases: newEntry.aliases || [],
            type: newEntry.entity_type,
            synopsis: newEntry.synopsis,
            status: newEntry.status
        });
    } catch (error: unknown) {
        console.error('Create Lore API Error:', error);
        return new Response('Internal Server Error: ' + (error as Error).message, { status: 500 });
    }
}
