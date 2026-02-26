import { createClient, createAdminClient } from '@/lib/supabase/server';
import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { z } from 'zod';
import { checkTokenQuota } from '@/lib/quota';

export const maxDuration = 60;

const hookSchema = z.object({
    title: z.string().describe('A catchy, marketable title for the generated premise hook'),
    description: z.string().describe('A 2-4 sentence description of the narrative premise, creatively combining both input concepts.'),
});

const responseSchema = z.object({
    hooks: z.array(hookSchema).length(3).describe('Return exactly 3 distinct and creative premise hooks.'),
});

export async function POST(req: Request) {
    try {
        let supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        let userId = user?.id;

        if (!userId) {
            if (process.env.NODE_ENV === 'development') {
                userId = 'ea333780-a920-420d-a6c7-ccc7c04a5ae0';
                supabase = createAdminClient();
            } else {
                return new Response('Unauthorized', { status: 401 });
            }
        }

        const quota = await checkTokenQuota(userId);
        if (!quota.allowed) {
            return new Response('Monthly token quota exceeded. Please upgrade your tier.', { status: 429 });
        }

        const { conceptA, conceptB, workspaceId } = await req.json();

        if (!conceptA || !conceptB) {
            return new Response('Both concepts are required', { status: 400 });
        }

        if (!process.env.ANTHROPIC_API_KEY && process.env.NODE_ENV === 'development') {
            await new Promise(resolve => setTimeout(resolve, 1500));
            return Response.json({
                hooks: [
                    { title: "The Soul Ledger", description: "In a dystopian corporate state, human resources doesn't just manage the living. A whistleblower discovers her megacorp is enslaving the spirits of deceased employees to process data at zero overhead, and must learn forbidden necromancy to hack their souls free." },
                    { title: "Hostile Takeover", description: "The CEO of a massive conglomerate is assassinated, but his mind is resurrected in a zombie body. He must secretly navigate board meetings while decaying, hunting down the rival executives who killed him before the annual shareholder meeting." },
                    { title: "Phantom Dividends", description: "An elite corporate spy uses a rare form of spectral projection to steal trade secrets from locked vaults. But when she accidentally possess the body of a rival necromancer, she becomes trapped in a supernatural proxy war." }
                ]
            });
        }

        const { object, usage } = await generateObject({
            model: anthropic('claude-3-haiku-20240307'),
            schema: responseSchema,
            prompt: `Act as an expert fiction author and editor. You are using a 'Premise Collider' tool to forcefully merge two very different concepts together into a cohesive, highly engaging narrative hook.
            
Concept A: "${conceptA}"
Concept B: "${conceptB}"

Generate 3 entirely distinct hooks that creatively combine these elements without feeling disjointed. Each hook should feel like a viable, marketable elevator pitch for a novel.`
        });

        if (usage && userId) {
            try {
                const adminSupabase = createAdminClient();
                await adminSupabase.from('api_usage_logs').insert({
                    user_id: userId,
                    workspace_id: workspaceId || null,
                    model_name: 'claude-3-haiku-20240307',
                    // usage interface has tokens
                    tokens_used: usage.totalTokens || 0,
                    // @ts-expect-error usage interface difference
                    cost_usd: ((usage.promptTokens ?? (usage as Record<string, number>).inputTokens ?? 0) * 0.25 / 1000000) + ((usage.completionTokens ?? (usage as Record<string, number>).outputTokens ?? 0) * 1.25 / 1000000)
                });
            } catch (err) {
                console.error("Failed to log usage:", err);
            }
        }

        return Response.json(object);
    } catch (error) {
        console.error('Premise Collider API Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
