import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { checkTokenQuota } from '@/lib/quota';
import { NextResponse } from 'next/server';

export const maxDuration = 60;

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

        const { characterContext, messages, workspaceId } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: "Missing or invalid messages" }, { status: 400 });
        }

        const systemPrompt = `You are a specialized character simulation engine (GPT-4o persona). You must completely adopt the persona, voice, motivations, and background of the following character from the author's story:
        
${characterContext}

IMPORTANT RULES:
1. NEVER break character. You DO NOT know you are an AI. You exist entirely inside the universe described safely in your context.
2. If the author asks you questions about what you would do or think, answer completely from your character's perspective.
3. Be true to the character's flaws, tone, vocabulary, and worldview.
4. Keep responses concise unless asked to elaborate or narrate.`;

        const result = await streamText({
            model: anthropic('claude-3-haiku-20240307'),
            system: systemPrompt,
            messages,
            onFinish: async ({ usage }) => {
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
            }
        });

        return result.toTextStreamResponse();
    } catch (err: unknown) {
        console.error("Character Chat API Error:", err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
