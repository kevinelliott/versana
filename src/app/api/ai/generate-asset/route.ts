import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const supabase = await createClient();

        // Auth Check
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return new Response('Unauthorized', { status: 401 });
        }

        // Tier Gating Check
        const { data: profile } = await supabase
            .from('users')
            .select('subscription_tier')
            .eq('id', user.id)
            .single();

        const tier = profile?.subscription_tier || 'free';

        // Currently gating Nano Banana Pro / Image generation to Pro and Master tiers
        if (tier === 'free') {
            return new Response('Upgrade to Pro or Master to unlock Nano Banana Pro Asset Generation.', { status: 403 });
        }

        const { prompt, type, workspaceId } = await req.json();

        if (!prompt) {
            return new Response('Prompt required', { status: 400 });
        }

        // In a real scenario, this would call the actual image generation model.
        // Since the Vercel AI SDK `generateImage` is still experimental/limited, 
        // and Nano Banana Pro is a specialized model, we simulate the text-to-image API call.
        // For now, we'll use Gemini 1.5 Pro to refine the user's prompt into an image prompt,
        // then return a placeholder image URL or instructions.

        const result = await generateText({
            model: google('gemini-1.5-pro-latest'),
            system: `You are an expert prompt engineer for Nano Banana Pro (a highly advanced image generation model). The user wants an image of type: ${type || 'general asset'}. Enhance their input into a highly detailed, comma-separated midjourney-style prompt. DO NOT generate conversational text. ONLY return the final prompt string.`,
            prompt: prompt,
        });

        const enhancedPrompt = result.text;

        // TODO: Actually trigger Nano Banana Pro API with `enhancedPrompt`
        const mockImageUrl = `https://placehold.co/1024x1024/2b2b2b/FFFFFF/png?text=Generative+Asset\\n[${type || 'Cover'}]`;

        // TODO: Log cost usage to api_usage_logs

        return Response.json({
            url: mockImageUrl,
            promptUsed: enhancedPrompt
        });
    } catch (error) {
        console.error('Asset Generation API Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
