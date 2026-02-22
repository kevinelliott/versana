import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { createClient, createAdminClient } from '@/lib/supabase/server';

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
            user = { id: userId } as any;
        }

        if (!userId) {
            return new Response('Unauthorized', { status: 401 });
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

        const { prompt, type, style } = await req.json();

        if (!prompt) {
            return new Response('Prompt required', { status: 400 });
        }

        // In a real scenario, this would call the actual image generation model.
        // Since the Vercel AI SDK `generateImage` is still experimental/limited, 
        // and Nano Banana Pro is a specialized model, we simulate the text-to-image API call.
        // For now, we'll use Gemini 1.5 Pro to refine the user's prompt into an image prompt,
        // then return a placeholder image URL or instructions.

        let enhancedPrompt = prompt;
        try {
            const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.OPENAI_API_KEY;
            if (apiKey) {
                const result = await generateText({
                    model: google('gemini-1.5-pro-latest'),
                    system: `You are an expert prompt engineer for Nano Banana Pro (a highly advanced image generation model). The user wants an image of type: ${type || 'general asset'} in the style of ${style || 'highly detailed, cinematic format'}. Enhance their input into a highly detailed, comma-separated midjourney-style prompt. DO NOT generate conversational text. ONLY return the final prompt string.`,
                    prompt: prompt,
                });
                enhancedPrompt = result.text;
            }
        } catch (e) {
            console.log("Failed to enhance prompt with Gemini, using original.");
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
            } else {
                console.error("OpenAI Image Error", await openAiRes.text());
            }
        }

        return Response.json({
            url: imageUrl,
            promptUsed: enhancedPrompt
        });
    } catch (error: any) {
        console.error('Asset Generation API Error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
