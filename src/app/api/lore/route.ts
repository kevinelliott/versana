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
        const formattedLore = (lore || []).map(e => {
            let richType = e.entity_type;
            let displayStatus = e.status;
            if (e.status && e.status.includes('|')) {
                const parts = e.status.split('|');
                displayStatus = parts[0];
                richType = parts.slice(1).join('|');
            }

            return {
                id: e.id,
                name: e.entity_name,
                aliases: e.aliases || [],
                type: richType,
                synopsis: e.synopsis,
                status: displayStatus
            };
        });

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

        // Map the rich type down to the 5 allowed Postgres enum constraint values
        let dbType = 'lore';
        const rawType = type.toLowerCase();
        if (rawType.includes('character') || rawType.includes('protagonist') || rawType.includes('antagonist') || rawType.includes('cast')) {
            dbType = 'character';
        } else if (rawType.includes('place') || rawType.includes('setting') || rawType.includes('location')) {
            dbType = 'place';
        } else if (rawType.includes('plot') || rawType.includes('hook') || rawType.includes('beat') || rawType.includes('scene')) {
            dbType = 'plot';
        } else if (rawType.includes('rule') || rawType.includes('constraint')) {
            dbType = 'rule';
        }

        const { data: newEntry, error } = await supabase
            .from('lore_entries')
            .insert({
                workspace_id: workspaceId,
                entity_name: name,
                entity_type: dbType,
                synopsis: synopsis,
                status: `Active|${type}` // Pack the dynamic AI type into the unconstrained status column
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
                    lore_entry_id: newEntry.id,
                    content: `[LORE: ${name} (${type})] ${synopsis}`,
                    embedding: embedding
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
            type: type, // Return the original rich type to the frontend
            synopsis: newEntry.synopsis,
            status: 'Active'
        });
    } catch (error: unknown) {
        console.error('Create Lore API Error:', error);
        return new Response('Internal Server Error: ' + (error as Error).message, { status: 500 });
    }
}

export async function PATCH(req: Request) {
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
        const { id, workspaceId, name, type, synopsis } = body;

        if (!id || !workspaceId || !name || !type) {
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

        // Map the rich type down to the 5 allowed Postgres enum constraint values
        let dbType = 'lore';
        const rawType = type.toLowerCase();
        if (rawType.includes('character') || rawType.includes('protagonist') || rawType.includes('antagonist') || rawType.includes('cast')) {
            dbType = 'character';
        } else if (rawType.includes('place') || rawType.includes('setting') || rawType.includes('location')) {
            dbType = 'place';
        } else if (rawType.includes('plot') || rawType.includes('hook') || rawType.includes('beat') || rawType.includes('scene')) {
            dbType = 'plot';
        } else if (rawType.includes('rule') || rawType.includes('constraint')) {
            dbType = 'rule';
        }

        const { data: updatedEntry, error } = await supabase
            .from('lore_entries')
            .update({
                entity_name: name,
                entity_type: dbType,
                synopsis: synopsis,
                status: `Active|${type}` // Pack the dynamic AI type into the unconstrained status column
            })
            .eq('id', id)
            .select('*')
            .single();

        if (error) {
            console.error("Supabase update error:", error);
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

            // Check if context embedding exists
            const { data: existingEmbedding } = await supabase
                .from('context_embeddings')
                .select('id')
                .eq('lore_entry_id', id)
                .single();

            if (existingEmbedding) {
                await supabase
                    .from('context_embeddings')
                    .update({
                        content: `[LORE: ${name} (${type})] ${synopsis}`,
                        embedding: embedding
                    })
                    .eq('lore_entry_id', id);
            } else {
                 await supabase
                    .from('context_embeddings')
                    .insert({
                        user_id: userId,
                        workspace_id: workspaceId,
                        lore_entry_id: id,
                        content: `[LORE: ${name} (${type})] ${synopsis}`,
                        embedding: embedding
                    });
            }

            if (usageTokens > 0) {
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
            console.error('Failed to update embedding for lore:', embeddingError);
        }

        return Response.json({
            id: updatedEntry.id,
            name: updatedEntry.entity_name,
            aliases: updatedEntry.aliases || [],
            type: type, // Return the original rich type to the frontend
            synopsis: updatedEntry.synopsis,
            status: 'Active'
        });
    } catch (error: unknown) {
        console.error('Update Lore API Error:', error);
        return new Response('Internal Server Error: ' + (error as Error).message, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return new Response('Entry ID required', { status: 400 });
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

        const { error } = await supabase
            .from('lore_entries')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return new Response('Entry deleted successfully', { status: 200 });
    } catch (error: unknown) {
        console.error('Delete Lore API Error:', error);
        return new Response('Internal Server Error: ' + (error as Error).message, { status: 500 });
    }
}
