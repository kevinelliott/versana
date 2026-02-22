import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { createClient, createAdminClient } from '@/lib/supabase/server';

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

        // TODO: In a real implementation, we would query the API Cost Tracking table here
        // to ensure the user hasn't exceeded their tier's monthly token limit before proceeding.

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
            model: anthropic('claude-3-5-sonnet-latest'),
            system: systemPrompt || 'You are an expert fiction co-writer assisting the author. Use the provided Context Matrix to ensure continuity.',
            messages,
        });

        // TODO: After stream completes, calculate token usage and log to api_usage_logs

        return result.toTextStreamResponse();
    } catch (error) {
        console.error('Claude API Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
