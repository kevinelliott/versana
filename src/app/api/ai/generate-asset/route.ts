import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { checkTokenQuota } from '@/lib/quota';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        let supabase = await createClient();

        // Auth Check
        let { data: { user } } = await supabase.auth.getUser();
        let userId = user?.id;

        // Local dev bypass
        if (!userId && process.env.NODE_ENV === 'development') {
            userId = 'ea333780-a920-420d-a6c7-ccc7c04a5ae0';
            supabase = createAdminClient();
            user = { id: userId } as { id: string, app_metadata: Record<string, unknown>, user_metadata: Record<string, unknown>, aud: string, created_at: string };
        }

        if (!userId) {
            return new Response('Unauthorized', { status: 401 });
        }

        const quota = await checkTokenQuota(userId);
        if (!quota.allowed) {
            return new Response('Monthly token quota exceeded. Please upgrade your tier.', { status: 429 });
        }

        // Tier Gating Check
        const { data: profile } = await supabase
            .from('users')
            .select('subscription_tier')
            .eq('id', userId)
            .single();

        const tier = profile?.subscription_tier || 'free';

        // Currently gating Nano Banana Pro / Image generation to Pro and Master tiers
        // In dev mode, we allow it
        if (tier === 'free' && process.env.NODE_ENV !== 'development') {
            return new Response('Upgrade to Pro or Master to unlock Nano Banana Pro Asset Generation.', { status: 403 });
        }

        const { prompt, type, style, workspaceId } = await req.json();

        if (!prompt) {
            return new Response('Prompt required', { status: 400 });
        }

        let enhancedPrompt = prompt;
        try {
            if (process.env.ANTHROPIC_API_KEY) {
                const { text, usage } = await generateText({
                    model: anthropic('claude-3-haiku-20240307'),
                    system: `You are an expert prompt engineer for Nano Banana Pro (a highly advanced image generation model). The user wants an image of type: ${type || 'general asset'} in the style of ${style || 'highly detailed, cinematic format'}. Enhance their input into a highly detailed, comma-separated midjourney-style prompt. DO NOT generate conversational text. ONLY return the final prompt string.`,
                    prompt: prompt,
                });
                enhancedPrompt = text;

                if (usage && userId) {
                    try {
                        const adminSupabase = createAdminClient();
                        await adminSupabase.from('api_usage_logs').insert({
                            user_id: userId,
                            workspace_id: workspaceId || null,
                            model_name: 'claude-3-haiku-20240307',
                            tokens_used: usage.totalTokens,
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            cost_usd: (((usage as any).promptTokens ?? (usage as any).inputTokens ?? 0) * 0.25 / 1000000) + (((usage as any).completionTokens ?? (usage as any).outputTokens ?? 0) * 1.25 / 1000000)
                        });
                    } catch (err) {
                        console.error("Failed to log Claude usage:", err);
                    }
                }
            }
        } catch (e: unknown) {
            console.log("Failed to enhance prompt with Claude, using original.", e);
        }

        let imageUrl = `https://placehold.co/1024x1024/2b2b2b/FFFFFF/png?text=Generative+Asset\\n[${encodeURIComponent(type)}]`;

        if (process.env.OPENAI_API_KEY) {
            // Generate real image via DALL-E 3 masquerading as Nano Banana Pro
            const openAiRes = await fetch('https://api.openai.com/v1/images/generations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: "dall-e-3",
                    prompt: enhancedPrompt,
                    n: 1,
                    size: "1024x1024"
                })
            });

            if (openAiRes.ok) {
                const data = await openAiRes.json();
                imageUrl = data.data[0].url;

                if (userId) {
                    try {
                        const adminSupabase = createAdminClient();
                        await adminSupabase.from('api_usage_logs').insert({
                            user_id: userId,
                            workspace_id: workspaceId || null,
                            model_name: 'dall-e-3',
                            tokens_used: 1, // Represents 1 image
                            cost_usd: 0.040 // Default pricing for DALL-E 3 standard 1024
                        });
                    } catch (err) {
                        console.error("Failed to log OpenAI usage:", err);
                    }
                }
            } else {
                console.error("OpenAI Image Error", await openAiRes.text());
            }
        }

        return Response.json({
            url: imageUrl,
            promptUsed: enhancedPrompt
        });
    } catch (error: unknown) {
        console.error('Asset Generation API Error:', error);
        return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
    }
}
