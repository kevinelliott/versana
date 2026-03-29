import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export const maxDuration = 60; // Allow 60 seconds

export async function POST(req: Request) {
    if (!process.env.ANTHROPIC_API_KEY) {
        return new NextResponse(JSON.stringify({ error: 'AI features are not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        let userId = user?.id;
        if (!userId) {
            if (process.env.NODE_ENV === 'development') {
                userId = 'ea333780-a920-420d-a6c7-ccc7c04a5ae0'; // Mock dev user
            } else {
                return new NextResponse('Unauthorized', { status: 401 });
            }
        }

        const { text, workspaceId } = await req.json();

        if (!text || text.trim() === '') {
            return new NextResponse(JSON.stringify({ error: 'No text provided' }), { status: 400 });
        }

        // Deduct Mana
        const { data: profile } = await supabase
            .from('profiles')
            .select('mana_balance')
            .eq('id', userId)
            .single();

        const cost = 2; // Fixed cost for inline edit

        if (!profile || profile.mana_balance < cost) {
            if (process.env.NODE_ENV !== 'development') {
                return new NextResponse(JSON.stringify({ error: 'Insufficient Mana.' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
            }
        }

        const systemPrompt = `You are a world-class literary editor. You rewrite user prose to drastically improve its quality. 
        Your primary focus is eliminating passive voice, fixing weak verbs, improving cadence, and enhancing "show, don't tell".
        
        Rules:
        1. Keep the narrative identical, just improve the prose.
        2. Format your response strictly as a valid JSON object with EXACTLY two fields:
           "suggested_text": The fully rewritten paragraph.
           "reason": A short 1-sentence explanation of what you specifically improved.
        3. Do NOT wrap the JSON in markdown blocks like \`\`\`json. Output raw JSON only.`;

        const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1500,
            temperature: 0.7,
            messages: [
                { role: 'user', content: systemPrompt },
                { role: 'user', content: `Improve this text: ${text}` }
            ]
        });

        const replyRaw = (response.content[0] as unknown as { text: string }).text;
        
        let resultData = { suggested_text: text, reason: "Failed to parse AI response" };
        try {
            // Claude sometimes still outputs json code blocks despite instructions
            const cleaned = replyRaw.replace(/```json/gi, '').replace(/```/g, '').trim();
            resultData = JSON.parse(cleaned);
        } catch (e) {
            console.error("Failed to parse Claude JSON response for deep edit:", replyRaw);
            return new NextResponse(JSON.stringify({ error: 'AI failed to format response correctly. Please try again.' }), { status: 500 });
        }

        // Deduct mana
        await supabase.rpc('deduct_mana', { amount: cost, user_id: userId });

        // Log the usage for gamification
        const { data: activeBook } = await supabase.from('books').select('id').eq('workspace_id', workspaceId).limit(1).single();
        if (activeBook) {
            const logDate = new Date().toISOString().split('T')[0];
            await supabase.rpc('increment_mana_spent', {
                target_book_id: activeBook.id,
                target_date: logDate,
                mana_amount: cost
            });
        }

        return NextResponse.json(resultData);

    } catch (e: any) {
        console.error('Text Generation API Error:', e);
        return new NextResponse(JSON.stringify({ error: e.message || 'Error executing AI action' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
