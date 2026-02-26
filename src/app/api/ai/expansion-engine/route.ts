import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { z } from 'zod';
import { NextResponse } from 'next/server';
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
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
        }

        const quota = await checkTokenQuota(userId);
        if (!quota.allowed) {
            return NextResponse.json({ error: 'Monthly token quota exceeded. Please upgrade your tier.' }, { status: 429 });
        }

        const { text, workspaceId, genre } = await req.json();

        if (!text || text.length < 100) {
            return NextResponse.json({ error: 'Text is too short for expansion. Please provide a detailed synopsis or short story.' }, { status: 400 });
        }

        const isNonFicProject = genre?.toLowerCase().includes('[non-fiction]') ?? false;

        const systemPrompt = isNonFicProject
            ? 'You are a master structural editor and writing coach specializing in non-fiction. The user will provide a short essay, article, or summary context. Your job is to structurally expand it into a comprehensive book outline. Deconstruct the given text into logical Parts/Chapters, identifying areas where new arguments, case studies, historical context, or practical applications should be injected.'
            : 'You are a master developmental editor and plotting expert. The user will provide a short story or a detailed premise. Your job is to structurally expand it into a full novel outline. Deconstruct the given story, identify the core narrative arc, and inject necessary sub-plots, character arcs, world-building detours, and raising stakes to stretch it into a full book structure.';

        const schemaDesc = isNonFicProject
            ? 'An array of structural sections/chapters for the expanded non-fiction book.'
            : 'An array of story beats or chapters for the expanded novel.';

        const { object, usage } = await generateObject({
            model: anthropic('claude-3-haiku-20240307'),
            schema: z.object({
                expandedOutline: z.array(z.object({
                    title: z.string().describe("The suggested title of the beat, chapter, or section."),
                    description: z.string().describe("A 2-3 sentence description of what happens or is argued in this expanded section. Explain how it extends the original concept."),
                    category: z.enum(['Setup', 'Rising Action', 'Sub-plot', 'Climax', 'Resolution', 'Concept', 'Case Study', 'Deep Dive']).describe("The structural role of this section.")
                })).min(5).max(15).describe(schemaDesc),
                summaryOfChanges: z.string().describe("A short explanation of how you expanded the original short text and what sub-plots or arguments you injected.")
            }),
            system: systemPrompt,
            prompt: `Original Text to Expand:\n\n${text}`,
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
        console.error("Expansion Engine API Error:", err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
