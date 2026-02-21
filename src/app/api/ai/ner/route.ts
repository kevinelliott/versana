import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return new Response('Unauthorized', { status: 401 });
        }

        const { text, workspaceId } = await req.json();

        if (!workspaceId || !text) {
            return new Response('Workspace ID and text required', { status: 400 });
        }

        // Fast Named Entity Recognition using GPT-4o-mini
        // We enforce structured output via Zod to get predictable arrays
        const result = await generateObject({
            model: openai('gpt-4o-mini'),
            system: 'You are a Named Entity Recognition (NER) pipeline for a fiction lore bible. Extract all significant proper nouns (characters, fictional places, unique lore items, factions, or plot events) from the provided text. Return ONLY the JSON array.',
            prompt: text,
            schema: z.object({
                entities: z.array(z.object({
                    name: z.string(),
                    category: z.enum(['character', 'place', 'lore', 'plot']),
                }))
            }),
        });

        // TODO: Log token usage to api_usage_logs

        return Response.json({ entities: result.object.entities });
    } catch (error) {
        console.error('NER API Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
