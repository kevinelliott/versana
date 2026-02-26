import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { z } from 'zod';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { checkTokenQuota } from '@/lib/quota';

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

        const quota = await checkTokenQuota(userId);
        if (!quota.allowed) {
            return new Response('Monthly token quota exceeded. Please upgrade your tier.', { status: 429 });
        }

        const { text, workspaceId } = await req.json();

        if (!workspaceId || !text) {
            return new Response('Workspace ID and text required', { status: 400 });
        }

        // Fetch existing lore entries to prevent duplicates
        const { data: existingLore, error: fetchError } = await supabase
            .from('lore_entries')
            .select('id, entity_name, aliases, entity_type, synopsis, status')
            .eq('workspace_id', workspaceId);

        if (fetchError) throw fetchError;

        const existingNames = new Set<string>();
        existingLore?.forEach(e => {
            existingNames.add(e.entity_name.toLowerCase());
            e.aliases?.forEach((a: string) => existingNames.add(a.toLowerCase()));
        });

        let generatedEntities: { name: string, category: 'character' | 'place' | 'lore' | 'plot' | 'rule' | 'faction', brief_synopsis: string }[] = [];

        if (!process.env.ANTHROPIC_API_KEY && process.env.NODE_ENV === 'development') {
            // Mock fallback for local testing when no API key is present
            console.log("No ANTHROPIC_API_KEY found. Using mock NER extraction.");
            if (text.includes('Tarkin')) {
                generatedEntities.push({
                    name: 'Governor Tarkin',
                    category: 'character',
                    brief_synopsis: 'A ruthless Imperial officer overseeing the Death Star.'
                });
            }
            if (text.includes('Aris')) {
                generatedEntities.push({
                    name: 'Captain Aris',
                    category: 'character',
                    brief_synopsis: 'A lone starship captain guarding an ancient datacore.'
                });
            }
            if (text.includes('Hegemony')) {
                generatedEntities.push({
                    name: 'The Hegemony',
                    category: 'lore',
                    brief_synopsis: 'A powerful authoritarian faction that sends mechs to capture targets.'
                });
            }
            if (text.includes('Death Star')) {
                generatedEntities.push({
                    name: 'Death Star',
                    category: 'place',
                    brief_synopsis: 'A moon-sized space station equipped with a super-laser capable of destroying planets.'
                });
            }
        } else {
            // Fast Named Entity Recognition using GPT-4o-mini
            const { object, usage } = await generateObject({
                model: anthropic('claude-3-haiku-20240307'),
                system: 'You are a Named Entity Recognition (NER) pipeline for a fiction lore bible. Extract all significant proper nouns (characters, fictional places, unique lore items, factions, or plot events) from the provided text. Return ONLY the JSON array.',
                prompt: text,
                schema: z.object({
                    entities: z.array(z.object({
                        name: z.string(),
                        category: z.enum(['character', 'place', 'lore', 'plot', 'rule', 'faction']),
                        brief_synopsis: z.string().describe('A 1-sentence summary of what this is based on context.')
                    }))
                }),
            });
            generatedEntities = object.entities;

            if (usage && userId) {
                try {
                    const adminSupabase = createAdminClient();
                    await adminSupabase
                        .from('api_usage_logs')
                        .insert({
                            user_id: userId,
                            workspace_id: workspaceId || null,
                            model_name: 'claude-3-haiku-20240307',
                            tokens_used: usage.totalTokens,
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            cost_usd: (((usage as any).promptTokens ?? (usage as any).inputTokens ?? 0) * 0.25 / 1000000) + (((usage as any).completionTokens ?? (usage as any).outputTokens ?? 0) * 1.25 / 1000000)
                        });
                } catch (err) {
                    console.error("Failed to log usage:", err);
                }
            }
        }

        const newEntities = generatedEntities.filter(e => !existingNames.has(e.name.toLowerCase()));

        let insertedEntities: Record<string, unknown>[] = [];

        if (newEntities.length > 0) {
            // Insert new entities into the database
            const recordsToInsert = newEntities.map(e => ({
                workspace_id: workspaceId,
                entity_name: e.name,
                aliases: [],
                entity_type: e.category,
                synopsis: e.brief_synopsis,
                status: 'Discovered'
            }));

            const { data: inserted, error: insertError } = await supabase
                .from('lore_entries')
                .insert(recordsToInsert)
                .select('id, entity_name, aliases, entity_type, synopsis, status');

            if (insertError) throw insertError;
            insertedEntities = inserted || [];
        }

        // Combine existing and newly inserted entities
        const allLoreEntries = [...(existingLore || []), ...insertedEntities];

        // Format to match the frontend LORE_DATABASE structure
        const formattedLore = allLoreEntries.map(e => ({
            id: e.id,
            name: e.entity_name,
            aliases: e.aliases || [],
            type: e.entity_type,
            synopsis: e.synopsis,
            status: e.status
        }));

        return Response.json({ entities: formattedLore });
    } catch (error) {
        console.error('NER API Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
