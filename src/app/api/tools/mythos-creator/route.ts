import { createClient, createAdminClient } from '@/lib/supabase/server';
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { checkTokenQuota } from '@/lib/quota';

export const maxDuration = 60;

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

        const { topic, workspaceId } = await req.json();

        if (!topic) {
            return new Response('Topic required', { status: 400 });
        }

        if (!process.env.ANTHROPIC_API_KEY && process.env.NODE_ENV === 'development') {
            await new Promise(resolve => setTimeout(resolve, 1500));
            return Response.json({
                mythos: `# The Children of the Sun\n\n## Overview\nAn ancient desert religion that worships the harsh, unyielding solar entity known as Sol-Kael. They believe that life is a test of endurance and that standing in the midday sun purifies the soul of its inherent moisture (sin).\n\n## Key Tenets\n- **The Drying:** To sweat is to expel weakness. Ritualistic sun-baking is performed weekly.\n- **The Night's Deceit:** The moon and stars are considered fractured lies; sleep is a necessary evil where one is most vulnerable to shadow.\n- **The Glass Ascendancy:** Fire and sand create glass. Believers strive to become "as clear as glass" so the Sun's light may pass through them unobstructed.\n\n## Linguistic Root (Solari)\n- **Kael'nath:** The purifying heat (literal: Sun's breath)\n- **Vash:** Water/Sin (used interchangeably)\n- **Ignis-Kor:** A sun-priest (literal: Heart of Fire)\n- **Dura:** Shade/Cowardice\n- **Sol'ari:** Sand (literal: The Sun's children)`
            });
        }

        const { text, usage } = await generateText({
            model: anthropic('claude-3-haiku-20240307'),
            system: 'You are an expert world-builder and linguist. Generate a highly detailed and coherent mythos, fictional religion, or naming convention based on the user prompt. Include a summary, key tenets/rules, and 5 example vocabulary words or names with meanings. Output in clear markdown format.',
            prompt: `Generate a mythos based on: ${topic}`
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

        return Response.json({ mythos: text });
    } catch (error) {
        console.error('Mythos Creator API Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
