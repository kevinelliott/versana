import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { z } from 'zod';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { checkTokenQuota } from '@/lib/quota';

export const maxDuration = 60;

const responseSchema = z.object({
    title: z.string().describe('A compelling, interesting title for this chapter.'),
});

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
                return new Response('Unauthorized', { status: 401 });
            }
        }

        const quota = await checkTokenQuota(userId);
        if (!quota.allowed) {
            return new Response('Monthly token quota exceeded. Please upgrade your tier.', { status: 429 });
        }

        const { content, chapters, workspaceId } = await req.json();

        // Need string to feed to AI
        const contextStr = Array.isArray(chapters)
            ? chapters.map(c => `Chapter ${c.order}: ${c.title}`).join('\n')
            : '';

        let prompt = `Act as an expert fiction author. Generate exactly ONE highly engaging chapter title.\n\n`;

        if (content && content.trim().length > 50) {
            prompt += `Here is the current content of the chapter being written:\n\n"${content.substring(0, 3000)}"\n\n`;
            prompt += `Generate a creative title that perfectly captures the essence of this scene or chapter.`;
        } else {
            prompt += `There is no content yet for this chapter. Please guess or suggest a natural progression for a title based on the other chapters.\n\n`;
            prompt += `Context of other chapters:\n${contextStr}\n\n`;
            prompt += `Generate a creative title that fits the progression.`;
        }

        if (!process.env.ANTHROPIC_API_KEY && process.env.NODE_ENV === 'development') {
            await new Promise(resolve => setTimeout(resolve, 800));
            return Response.json({
                title: 'The Calm Before the Storm'
            });
        }

        const { object, usage } = await generateObject({
            model: anthropic('claude-3-haiku-20240307'),
            schema: responseSchema,
            prompt: prompt
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

        return Response.json(object);
    } catch (error) {
        console.error('Generate Title API Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
