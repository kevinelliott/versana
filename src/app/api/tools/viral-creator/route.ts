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

        const { topic, platform, workspaceId } = await req.json();

        if (!topic || !platform) {
            return new Response('Topic and platform required', { status: 400 });
        }

        if (!process.env.ANTHROPIC_API_KEY && process.env.NODE_ENV === 'development') {
            await new Promise(resolve => setTimeout(resolve, 1500));
            return Response.json({
                asset: `**[VISUAL: You staring into the camera, looking slightly exasperated but excited.]**\n\n**[ON-SCREEN TEXT: "Why do all magic systems let you just sleep to get your mana back?"]**\n\n"Okay, hear me out. If you're tired of fantasy books where mages just chug a blue potion or take a nap to get their magic back, you need to read this."\n\n**[VISUAL: Cut to you holding a printed manuscript or book mockup. Fast zoom in.]**\n\n"In my book, casting a spell doesn't cost mana. It costs memories."\n\n**[ON-SCREEN TEXT: "MAGIC = MEMORY LOSS"]**\n\n"Want to throw a fireball? Kiss the memory of your elementary school best friend goodbye. Want to fly? You might forget your mother's face."\n\n**[VISUAL: You lean closer to the camera, lowering your voice.]**\n\n"My main character has to stop a kingdom-ending threat... but to cast the spell big enough to do it, she's going to forget who she's trying to save."\n\n**[ON-SCREEN TEXT: "Link in bio to read the first 3 chapters free!"]**\n\n"If you love gritty, high-stakes fantasy, tap the link in my bio. The first three chapters are up now."`
            });
        }

        const { text, usage } = await generateText({
            model: anthropic('claude-3-haiku-20240307'),
            system: `You are an expert ${platform} marketing specialist for fiction authors. You know exactly how to hook an audience in the first 3 seconds, keep retention high, and craft compelling call-to-actions. Generate a script or post outline based on the user's premise. Format it cleanly with [VISUAL/ON-SCREEN TEXT] instructions where appropriate.`,
            prompt: `Generate a highly engaging viral social media asset for this premise/idea: ${topic}`
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

        return Response.json({ asset: text });
    } catch (error) {
        console.error('Viral Creator API Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
