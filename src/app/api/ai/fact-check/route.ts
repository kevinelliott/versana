import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { z } from 'zod';
import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { checkTokenQuota } from '@/lib/quota';

export const maxDuration = 60; // Allow 60 seconds

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

        const { lore, checkType } = await req.json();

        // `lore` is the Context Matrix (array of objects)
        const loreContextString = lore && lore.length > 0
            ? `CONTEXT MATRIX:\n${lore.map((l: Record<string, string>) => `${l.name} (${l.type}): ${l.synopsis}`).join('\n')}`
            : 'No Context Matrix provided.';

        let systemPrompt = `You are a Logic & Physics Fact-Checker for an author's fictional universe. 
Evaluate the provided Context Matrix against real-world logic, physics, constraints, and internal consistency.
Find potential plot holes, contradictions in the magic system, geographic impossibilities, or historical timeline errors.`;

        if (checkType === 'physics') {
            systemPrompt += ` Focus exclusively on physics, biomechanics, and hard-science anomalies (e.g. gravity, energy consumption, material strength).`;
        } else if (checkType === 'logic') {
            systemPrompt += ` Focus exclusively on narrative logic, internal consistency, and plot-hole detection (e.g. why didn't they fly the eagles to Mordor?).`;
        }

        const { object, usage } = await generateObject({
            model: anthropic('claude-3-haiku-20240307'),
            schema: z.object({
                findings: z.array(z.object({
                    title: z.string().describe("Short punchy title of the issue found."),
                    status: z.enum(['VERIFIED', 'FLAGGED', 'WARNING']).describe("VERIFIED means logic holds up. FLAGGED means direct contradiction. WARNING means plausible but risky."),
                    explanation: z.string().describe("Detailed breakdown of the physical/logical contradiction and how to fix it in 2-3 sentences.")
                }))
            }),
            system: systemPrompt,
            prompt: `Please run an audit on the following Context Matrix:\n\n${loreContextString}`,
        });

        if (usage && userId) {
            try {
                const adminSupabase = createAdminClient();
                await adminSupabase.from('api_usage_logs').insert({
                    user_id: userId,
                    model_name: 'claude-3-haiku-20240307',
                    tokens_used: usage.totalTokens,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    cost_usd: (((usage as any).promptTokens ?? (usage as any).inputTokens ?? 0) * 0.25 / 1000000) + (((usage as any).completionTokens ?? (usage as any).outputTokens ?? 0) * 1.25 / 1000000)
                });
            } catch (err) {
                console.error("Failed to log Claude usage:", err);
            }
        }

        return NextResponse.json(object);
    } catch (e: unknown) {
        console.error("Fact-Check Error:", e);
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}
