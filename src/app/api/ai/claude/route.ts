import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { createClient } from '@/lib/supabase/server';

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const supabase = await createClient();

        // Simple Auth/Tier Gate check
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return new Response('Unauthorized', { status: 401 });
        }

        const { messages, workspaceId, systemPrompt } = await req.json();

        if (!workspaceId) {
            return new Response('Workspace ID required', { status: 400 });
        }

        // TODO: In a real implementation, we would query the API Cost Tracking table here
        // to ensure the user hasn't exceeded their tier's monthly token limit before proceeding.

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
