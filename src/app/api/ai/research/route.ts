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

        const { query, workspaceId } = await req.json();

        if (!query) {
            return NextResponse.json({ error: "Missing query" }, { status: 400 });
        }

        const { object, usage } = await generateObject({
            model: anthropic('claude-3-haiku-20240307'),
            schema: z.object({
                results: z.array(z.object({
                    title: z.string().describe("The headline of the research finding."),
                    source: z.string().describe("The domain or organization name of the source (e.g. NASA.gov, Nature, Wikipedia)."),
                    snippet: z.string().describe("A concise 2-sentence summary of the factual finding."),
                    url: z.string().url().describe("A plausible URL for the source.")
                })).min(1).max(3).describe("A list of relevant research results."),
                locations: z.array(z.object({
                    lng: z.number().describe("Longitude coordinate of the location."),
                    lat: z.number().describe("Latitude coordinate of the location."),
                    title: z.string().describe("Name of the location.")
                })).max(3).optional().describe("If the research query involves physical locations on Earth, provide 1-3 coordinates related to the context.")
            }),
            system: "You are a highly intelligent semantic search engine and researcher for an author. The author is writing a book and needs accurate, real-world information. Search your broad knowledge base for the exact answer to their query and synthesize it into 2-3 highly distinct and detailed search results. Format as professional research citations. If the topic involves real-world cartography, return exact lng/lat coordinates to be pinned on a map.",
            prompt: `Research Query: "${query}"`,
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
        console.error("Research API Error:", err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
