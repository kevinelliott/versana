import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { z } from 'zod';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

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
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
        }

        const { messages, genre } = await req.json();

        // Basic fallback for when Anthropic API key is missing in dev mode
        if (!process.env.ANTHROPIC_API_KEY && process.env.NODE_ENV === 'development') {
            await new Promise(r => setTimeout(r, 1000));
            return NextResponse.json({ reply: 'Haha, that sounds awesome! What kind of protagonist are we looking at here? Do they have a dark past?' });
        }

        const { object } = await generateObject({
            model: anthropic('claude-3-haiku-20240307'),
            schema: z.object({
                reply: z.string().describe('The conversational response and question directed at the user.'),
                suggestions: z.array(z.string()).describe('An array of exactly 3 distinct, creative, actionable multiple-choice answers the user could choose.')
            }),
            system: `You are the Story Architect for Versana, an AI co-writing platform. 
The user is building a new universe in the genre of: ${genre}.
Your goal is to briefly interview them to extract a core premise, a protagonist, and a setting.
Keep your responses very conversational, short, and dynamic. Ask exactly one question per message. Provide 3 short, brilliant multiple-choice suggestions in the structured JSON array corresponding to the question you just asked to help them choose easily.`,
            messages
        });

        return NextResponse.json({ reply: object.reply, suggestions: object.suggestions });

    } catch (err: unknown) {
        console.error('Onboarding Chat Error:', err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
