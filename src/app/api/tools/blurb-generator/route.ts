import { createClient, createAdminClient } from '@/lib/supabase/server';
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';
import { checkTokenQuota } from '@/lib/quota';

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
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
        }

        const quotaResult = await checkTokenQuota(userId);
        if (!quotaResult.allowed) {
            return NextResponse.json({ error: 'Monthly token quota exceeded. Please upgrade your tier.' }, { status: 429 });
        }

        const { contextText, workspaceId, type } = await req.json();

        if (!contextText) {
            return NextResponse.json({ error: "Missing context" }, { status: 400 });
        }

        const systemPrompt = type === 'short'
            ? 'You are an expert literary publicist. Given the Context Matrix, write a highly punchy, high-concept 1-2 sentence logline/elevator pitch. Output ONLY the short pitch.'
            : 'You are an expert literary publicist. Given the Context Matrix, write a compelling, high-stakes book blurb designed for a back cover or Amazon. Focus on the core conflict, the protagonist, and the setting. Output ONLY the blurb paragraphs without Markdown tags.';

        const { text, usage } = await generateText({
            model: anthropic('claude-3-haiku-20240307'),
            system: systemPrompt,
            prompt: `CONTEXT MATRIX:\n${contextText}`,
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

        return NextResponse.json({ blurb: text });
    } catch (err: unknown) {
        console.error("Blurb Generator API Error:", err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
