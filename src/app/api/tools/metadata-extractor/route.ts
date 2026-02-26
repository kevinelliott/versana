import { createClient, createAdminClient } from '@/lib/supabase/server';
import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { z } from 'zod';
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

        const quota = await checkTokenQuota(userId);
        if (!quota.allowed) {
            return NextResponse.json({ error: 'Monthly token quota exceeded. Please upgrade your tier.' }, { status: 429 });
        }

        const { blurb, workspaceId } = await req.json();

        if (!blurb) {
            return NextResponse.json({ error: "Missing blurb" }, { status: 400 });
        }

        const { object, usage } = await generateObject({
            model: anthropic('claude-3-haiku-20240307'),
            schema: z.object({
                keywords: z.array(z.string()).min(1).max(7).describe("Exactly 7 SEO keywords for KDP."),
                bisac: z.array(z.string()).min(1).max(2).describe("Exactly 2 valid BISAC subject codes.")
            }),
            system: "You are an expert book marketer. Extract metadata from the blurb into JSON. Respond ONLY with valid JSON with keys 'keywords' (array of 7 SEO strings) and 'bisac' (array of 2 BISAC strings).",
            prompt: `Please extract metadata. Here is the blurb: ${blurb}`,
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

        return NextResponse.json(object);
    } catch (err: unknown) {
        console.error("Metadata Extractor API Error:", err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
