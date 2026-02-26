import { createClient, createAdminClient } from '@/lib/supabase/server';
import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { z } from 'zod';
import { checkTokenQuota } from '@/lib/quota';

export const maxDuration = 60;

const analysisSchema = z.object({
    viabilityScore: z.number().describe('A score from 0 to 100 representing market viability'),
    viabilityLabel: z.string().describe('Short label for viability, e.g. "High Demand, High Competition"'),
    viabilityDescription: z.string().describe('A 2-3 sentence overview of why this premise is viable or not in the current market.'),
    tropesToSubvert: z.array(z.object({
        name: z.string(),
        description: z.string().describe('How to subvert this cliché trope')
    })).describe('List 2-3 common tropes for this premise and how to uniquely subvert them'),
    demographic: z.string().describe('Estimated target demographic, e.g. "Age 18-35 (65% Female)"'),
    targetKeyword: z.string().describe('Primary hashtag or Amazon keyword label'),
    wordCountRange: z.string().describe('Ideal word count range, e.g. "75,000 - 90,000 words"'),
    wordCountReasoning: z.string().describe('One sentence explanation for the word count range.')
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

        const { premise, workspaceId } = await req.json();

        if (!premise) {
            return new Response('Premise required', { status: 400 });
        }

        if (!process.env.ANTHROPIC_API_KEY && process.env.NODE_ENV === 'development') {
            await new Promise(resolve => setTimeout(resolve, 1500));
            return Response.json({
                viabilityScore: 82,
                viabilityLabel: "High Demand, Low Saturation",
                viabilityDescription: "This unique combination shows strong potential. While the primary trope is common, the setting subverts expectations, making it highly marketable to a core niche looking for fresh takes.",
                tropesToSubvert: [
                    { name: "The Generic Chosen One", description: "Standard. Try making them a competent professional who was explicitly *not* chosen but had to take the role." },
                    { name: "The Shadowy Council", description: "Overused. Try framing the antagonist force as a disorganized, chaotic start-up rather than ancient masterminds." }
                ],
                demographic: "Age 20-40 (Balanced)",
                targetKeyword: "#SpeculativeFiction",
                wordCountRange: "80,000 - 100,000 words",
                wordCountReasoning: "Readers of this genre expect sufficient world-building padding without dragging into epic fantasy lengths."
            });
        }

        const { object, usage } = await generateObject({
            model: anthropic('claude-3-haiku-20240307'),
            schema: analysisSchema,
            prompt: `Analyze the following fiction book premise against current Amazon KDP and general publishing market trends. Provide a realistic, analytical market breakdown estimating viability, tropes to subvert, demographics, keywords, and word counts.\n\nPremise/Input: "${premise}"`
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
        console.error('Market Analyzer API Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
