import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { anthropic } from '@ai-sdk/anthropic';
import { generateObject, generateText } from 'ai';
import { z } from 'zod';
import { checkTokenQuota } from '@/lib/quota';

export const maxDuration = 60;

export async function GET(req: Request) {
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

        const { searchParams } = new URL(req.url);
        const workspaceId = searchParams.get('workspaceId');

        if (!workspaceId) {
            return NextResponse.json({ error: 'workspaceId required' }, { status: 400 });
        }

        const { data: books, error } = await supabase
            .from('books')
            .select('*')
            .eq('workspace_id', workspaceId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return NextResponse.json(books);
    } catch (err: unknown) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}

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

        const { workspaceId, title, genre, type, prompt, count } = await req.json();

        if (!workspaceId || !title) {
            return NextResponse.json({ error: 'workspaceId and title required' }, { status: 400 });
        }

        const { data: newBook, error: createError } = await supabase
            .from('books')
            .insert({
                workspace_id: workspaceId,
                title,
                genre: genre || 'General Fiction' // Will be ignored if not passed, but allows overriding.
            })
            .select()
            .single();

        if (createError) throw createError;

        if (type === 'scaffold' || type === 'generate') {
            const quota = await checkTokenQuota(userId);
            if (quota.allowed) {
                try {
                    const { data: workspace } = await supabase.from('workspaces').select('name, genre').eq('id', workspaceId).single();
                    const { data: lore } = await supabase.from('lore_entries').select('entity_name, synopsis, entity_type').eq('workspace_id', workspaceId);

                    const isNonFic = workspace?.genre?.toLowerCase().includes('[non-fiction]');
                    const loreContext = lore?.map((l: Record<string, string>) => `${l.entity_name} (${l.entity_type}): ${l.synopsis}`).join('\n') || 'No context provided.';

                    const systemPrompt = isNonFic
                        ? `Act as an expert non-fiction editor. Book Title: "${title}". Workspace: "${workspace?.name}". Knowledge Base: \n${loreContext}\n\nTask: Based on the provided prompt, generate a structural outline for a new book.`
                        : `Act as an expert fiction author. Book Title: "${title}". Universe: "${workspace?.name}". Lore: \n${loreContext}\n\nTask: Based on the provided prompt, generate a chapter-by-chapter outline for a new book.`;

                    const targetCount = count || 5;

                    const outlineSchema = z.object({
                        chapters: z.array(z.object({
                            title: z.string().describe('Chapter or section title'),
                            description: z.string().describe('One to two paragraph rich summary of what happens in this specific chapter/section')
                        })).length(targetCount).describe(`Generate exactly ${targetCount} detailed chapters/sections.`)
                    });

                    const { object } = await generateObject({
                        model: anthropic('claude-3-haiku-20240307'),
                        schema: outlineSchema,
                        prompt: `${systemPrompt}\n\nUser Prompt: "${prompt}"\n\nGenerate exactly ${targetCount} chapters based on this.`,
                    });

                    if (type === 'scaffold') {
                        const chapterInserts = object.chapters.map((ch, i) => ({
                            workspace_id: workspaceId,
                            book_id: newBook.id,
                            title: ch.title,
                            order_index: i,
                            content: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: `[Book Scaffolding Note: ${ch.description}]` }] }] }
                        }));
                        await supabase.from('chapters').insert(chapterInserts);
                    } else if (type === 'generate') {
                        const chapterPromises = object.chapters.map(async (ch, i) => {
                            const { text } = await generateText({
                                model: anthropic('claude-3-haiku-20240307'),
                                prompt: `${systemPrompt}\n\nWrite the complete prose/content for the following section/chapter. Do not include titles or pleasantries, just the content.\n\nChapter/Section Title: ${ch.title}\nChapter/Section Summary: ${ch.description}\n\nMake it at least 2 paragraphs of high-quality content based heavily on the Knowledge Base / Lore provided earlier.`,
                            });

                            const paragraphs = text.split('\n\n').filter(p => p.trim() !== '').map(p => ({
                                type: "paragraph",
                                content: [{ type: "text", text: p.trim() }]
                            }));

                            return {
                                workspace_id: workspaceId,
                                book_id: newBook.id,
                                title: ch.title,
                                order_index: i,
                                content: { type: "doc", content: paragraphs }
                            };
                        });

                        const resolvedChapters = await Promise.all(chapterPromises);
                        await supabase.from('chapters').insert(resolvedChapters);
                    }
                } catch (aiErr) {
                    console.error("AI Generation failed logic:", aiErr);
                    // Book was created, but generation failed, silently continue.
                }
            }
        }

        return NextResponse.json(newBook);
    } catch (err: unknown) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
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

        const { searchParams } = new URL(req.url);
        const bookId = searchParams.get('bookId');

        if (!bookId) {
            return NextResponse.json({ error: 'bookId required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('books')
            .delete()
            .eq('id', bookId);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
