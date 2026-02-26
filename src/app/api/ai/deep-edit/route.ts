import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { z } from 'zod';
import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { checkTokenQuota } from '@/lib/quota';

export const maxDuration = 60; // Allow it to run a bit longer for long texts

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
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
        }

        const quota = await checkTokenQuota(userId);
        if (!quota.allowed) {
            return NextResponse.json({ error: 'Monthly token quota exceeded. Please upgrade your tier.' }, { status: 429 });
        }

        const { text, lore, workspaceId } = await req.json();

        if (!text) {
            return NextResponse.json({ error: "Missing manuscript text" }, { status: 400 });
        }

        const loreContextString = lore && lore.length > 0
            ? `CONTEXT MATRIX:\n${lore.map((l: Record<string, string>) => `${l.name} (${l.type}): ${l.synopsis}`).join('\n')}`
            : 'No Context Matrix provided.';

        const { object, usage } = await generateObject({
            model: anthropic('claude-3-haiku-20240307'),
            schema: z.object({
                pacing: z.string().describe("Feedback on the structural pacing and flow of the text."),
                characters: z.string().describe("Feedback on character consistency against the Context Matrix, or general characterization."),
                grammar: z.string().describe("A summary of recurring stylistic or grammatical issues in the prose.")
            }),
            system: "You are a professional literary developmental editor. Analyze the provided manuscript excerpt against the Context Matrix. Provide constructive, high-level feedback in exactly three categories: Pacing & Structure, Character Consistency, and Prose/Grammar.",
            prompt: `Manuscript Text:\n${text.substring(0, 15000)}\n\n${loreContextString}`,
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

        return NextResponse.json(object);
    } catch (err: unknown) {
        console.error("Deep Edit API Error:", err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
