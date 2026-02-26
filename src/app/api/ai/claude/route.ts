import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { checkTokenQuota } from '@/lib/quota';

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        let supabase = await createClient();

        // Simple Auth/Tier Gate check
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

        const { messages, workspaceId, systemPrompt } = await req.json();

        if (!workspaceId) {
            return new Response('Workspace ID required', { status: 400 });
        }

        const quota = await checkTokenQuota(userId);
        if (!quota.allowed) {
            return new Response('Monthly token quota exceeded. Please upgrade your tier.', { status: 429 });
        }

        console.log("ANTHROPIC_API_KEY:", process.env.ANTHROPIC_API_KEY ? "EXISTS" : "UNDEFINED");

        if (!process.env.ANTHROPIC_API_KEY && process.env.NODE_ENV === 'development') {
            const mockDraft = `The snow fell heavy over the battlements of the old fort. Captain Aris tightened his grip on the plasma rifle, his breath pluming in the frigid air. The wind howled through the jagged machicolations like a dying beast, biting through his thermal layers. The Rebellion could not afford to lose this vantage point.\n\n"They're coming from the eastern ridge," shouted Mira, pointing toward the jagged peaks.\n\nThe mechs broke through the tree line, their red ocular sensors piercing the blizzard. Aris took aim, the familiar hum of the plasma coils vibrating against his shoulder. It was time.`;

            // Create a ReadableStream to simulate streaming
            const stream = new ReadableStream({
                async start(controller) {
                    const words = mockDraft.split(' ');
                    for (const word of words) {
                        controller.enqueue(new TextEncoder().encode(word + ' '));
                        // Simulate delay between words
                        await new Promise(resolve => setTimeout(resolve, 50));
                    }
                    controller.close();
                }
            });

            return new Response(stream, {
                headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                },
            });
        }

        const result = streamText({
            model: anthropic('claude-3-haiku-20240307'),
            system: systemPrompt || 'You are an expert fiction co-writer assisting the author. Use the provided Context Matrix to ensure continuity.',
            messages,
            onFinish: async ({ usage }) => {
                if (usage && userId) {
                    try {
                        const adminSupabase = createAdminClient();
                        await adminSupabase
                            .from('api_usage_logs')
                            .insert({
                                user_id: userId,
                                workspace_id: workspaceId,
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
    } catch (error) {
        console.error('Claude API Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
