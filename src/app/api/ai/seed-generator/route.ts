import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { z } from 'zod';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { checkTokenQuota } from '@/lib/quota';

export const maxDuration = 60;

const conceptSchema = z.object({
    id: z.string().describe('A unique identifier for the concept'),
    title: z.string().describe('A catchy, marketable title for the generated premise hook'),
    description: z.string().describe('A 2-4 sentence description of the narrative concept and high-level plot mechanics.'),
});

const responseSchema = z.object({
    concepts: z.array(conceptSchema).length(4).describe('Return exactly 4 distinct and creative premise concepts.'),
});

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

        const { prompt, workspaceId } = await req.json();

        if (!prompt) {
            return new Response('Prompt is required', { status: 400 });
        }

        if (!process.env.ANTHROPIC_API_KEY && process.env.NODE_ENV === 'development') {
            await new Promise(resolve => setTimeout(resolve, 1500));
            return Response.json({
                concepts: [
                    {
                        id: '1',
                        title: 'The Silent Starship',
                        description: `A generation ship where the AI has enforced absolute silence to "prevent conflict," leading the crew to develop a complex sign language relying on ambient light reflection.`
                    },
                    {
                        id: '2',
                        title: 'Echoes of the Void',
                        description: `In a universe where faster-than-light travel requires sacrificing a memory, a renowned pilot begins to realize they are the cause of the war they are fighting so desperately to win.`
                    },
                    {
                        id: '3',
                        title: 'The Clockwork Rebellion',
                        description: `Automations powered by captured human souls reach sentience when a watchmaker accidentally builds a gear capable of processing paradoxes.`
                    },
                    {
                        id: '4',
                        title: 'Neon Requiem',
                        description: `A cyberpunk detective must solve the murder of an AI that had achieved Nirvana, navigating religious cults that worship rogue software.`
                    }
                ]
            });
        }

        const { object, usage } = await generateObject({
            model: anthropic('claude-3-haiku-20240307'),
            schema: responseSchema,
            prompt: `Act as an expert fiction author and editor. You are using a 'Seed Generator' tool to ideate concepts based on a user's initial genre, trope, or seed idea.
            
Seed Idea: "${prompt}"

Generate 4 entirely distinct, highly engaging narrative hook concepts that explore this prompt from different angles. Make them creative, market-viable, and narratively rich.`
        });

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

        return Response.json(object);
    } catch (error) {
        console.error('Seed Generator API Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
