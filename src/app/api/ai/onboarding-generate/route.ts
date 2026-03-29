import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { z } from 'zod';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const maxDuration = 60; // Allow more time for large generation

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

        const { messages, genre, scope } = await req.json();

        // 1. Determine generation requirements based on scope
        let chapterCount = 1;
        let loreCount = 3;
        if (scope === 'outline') {
            chapterCount = 10;
            loreCount = 5;
        } else if (scope === 'chapters') {
            chapterCount = 12;
            loreCount = 8;
        } else if (scope === 'book') {
            chapterCount = 20;
            loreCount = 15;
        }

        // Mock response if no API key in dev mode
        if (!process.env.ANTHROPIC_API_KEY && process.env.NODE_ENV === 'development') {
            await new Promise(r => setTimeout(r, 2000));
            // Just simulate creating a basic workspace
            const adminSupabase = createAdminClient();
            const { data: ws } = await adminSupabase.from('workspaces').insert({
                user_id: userId,
                name: "The Neon Citadel (Mocked)",
                genre
            }).select().single();
            return NextResponse.json({ success: true, workspace: ws });
        }

        // 2. Call AI to generate universe data
        const { object } = await generateObject({
            model: anthropic('claude-3-haiku-20240307'),
            schema: z.object({
                workspaceName: z.string().describe('A catchy, punchy name for this story universe.'),
                bookTitle: z.string().describe('The title of the first book or primary project.'),
                lore: z.array(z.object({
                    name: z.string(),
                    type: z.enum(['character', 'place', 'lore', 'plot', 'rule']),
                    synopsis: z.string().describe('A 1-2 sentence detailed description.')
                })).length(loreCount).describe(`Generate exactly ${loreCount} important lore entities based on the chat.`),
                chapters: z.array(z.object({
                    title: z.string(),
                    synopsis: z.string().describe('A 2-3 sentence summary of what happens in this chapter.')
                })).length(chapterCount).describe(`Generate an outline of exactly ${chapterCount} chapters that forms a complete narrative arc.`),
            }),
            messages: [
                { role: 'system', content: `You are the Master Architect. Review the following interview with an author writing a ${genre} story. Build the final structured universe matrix exactly as requested.` },
                // Convert messages format to basic text dump for generation
                { role: 'user', content: `Here is the interview transcript:\n\n${messages.map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}` }
            ]
        });

        // 3. Database Operations (Atomic-ish)
        const adminSupabase = createAdminClient();

        // Create Workspace
        const { data: ws, error: wsError } = await adminSupabase
            .from('workspaces')
            .insert({ user_id: userId, name: object.workspaceName, genre })
            .select()
            .single();

        if (wsError || !ws) throw new Error('Failed to create workspace');

        // Create Book
        const { data: book, error: bookError } = await adminSupabase
            .from('books')
            .insert({ workspace_id: ws.id, title: object.bookTitle, genre })
            .select()
            .single();

        if (bookError || !book) throw new Error('Failed to create book');

        // Insert Chapters
        // We embed the standard AI generated overview into the actual TipTap empty content
        const chapterInserts = object.chapters.map((ch, idx) => ({
            workspace_id: ws.id,
            book_id: book.id,
            title: ch.title,
            content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: `[OUTLINE: ${ch.synopsis}]` }] }] },
            order_index: idx
        }));
        await adminSupabase.from('chapters').insert(chapterInserts);

        // Insert Lore
        const loreInserts = object.lore.map((l) => ({
            workspace_id: ws.id,
            entity_name: l.name,
            entity_type: l.type,
            synopsis: l.synopsis
        }));
        await adminSupabase.from('lore_entries').insert(loreInserts);

        // Usage Logging (Approximation)
        await adminSupabase.from('api_usage_logs').insert({
            user_id: userId,
            workspace_id: ws.id,
            model_name: 'claude-3-haiku-20240307',
            tokens_used: 1500 + (loreCount * 50) + (chapterCount * 50),
            cost_usd: 0.005
        });

        return NextResponse.json({ success: true, workspace: ws });

    } catch (err: unknown) {
        console.error('Onboarding Generation Error:', err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
