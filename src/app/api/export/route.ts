import { createClient, createAdminClient } from '@/lib/supabase/server';
import epub from 'epub-gen-memory';
import { Document, Packer, Paragraph, TextRun } from "docx";
import { generateHTML } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
import { LoreTag } from '@/components/workspace/editor/LoreTagExtension';
import type { JSONContent } from '@tiptap/core';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const workspaceId = searchParams.get('workspaceId');
        const bookId = searchParams.get('bookId');
        const format = searchParams.get('format'); // 'epub' or 'docx'

        if (!workspaceId || !bookId || !format) {
            return new Response('Missing parameters', { status: 400 });
        }

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

        // Fetch workspace
        const { data: workspace, error: wsError } = await supabase
            .from('workspaces')
            .select('*')
            .eq('id', workspaceId)
            .single();

        if (wsError || !workspace) {
            return new Response('Workspace not found', { status: 404 });
        }

        const { data: book, error: bookError } = await supabase
            .from('books')
            .select('*')
            .eq('id', bookId)
            .single();

        if (bookError || !book) {
            return new Response('Book not found', { status: 404 });
        }

        // Fetch chapters
        const { data: chapters, error: chpsError } = await supabase
            .from('chapters')
            .select('*')
            .eq('book_id', bookId)
            .order('order_index', { ascending: true });

        if (chpsError) {
            return new Response('Error fetching chapters', { status: 500 });
        }

        const fallbackTitle = book.title || workspace.name || "Untitled Book";
        const fallbackAuthor = (workspace.board_state as Record<string, Record<string, unknown>>)?.cover_design?.author as string || "Author";

        if (format === 'epub') {
            const epubChapters = chapters.map((ch: { title?: string, content?: JSONContent }, index: number) => {
                let htmlContent = '<p></p>';
                if (ch.content) {
                    htmlContent = generateHTML(ch.content, [StarterKit, LoreTag]);
                }
                return {
                    title: ch.title || `Chapter ${index + 1}`,
                    content: htmlContent,
                };
            });

            // Convert to EPUB Buffer
            const buffer = await epub({
                title: fallbackTitle,
                author: fallbackAuthor,
                cover: workspace.board_state?.cover_design?.coverImageUrl || undefined,
            }, epubChapters);

            const headers = new Headers();
            headers.set('Content-Type', 'application/epub+zip');
            headers.set('Content-Disposition', `attachment; filename="${fallbackTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.epub"`);

            return new Response(buffer as unknown as BodyInit, { status: 200, headers });
        } else if (format === 'docx') {
            const docChildren: Paragraph[] = [];

            // Very simple Word generator reading raw text for manuscript
            for (const [index, ch] of chapters.entries()) {
                docChildren.push(new Paragraph({
                    children: [new TextRun({ text: ch.title || `Chapter ${index + 1}`, bold: true, size: 32 })],
                    spacing: { after: 400 }
                }));

                if (ch.content) {
                    // For DOCX, we quickly extract plain text paragraphs from our TipTap structure
                    const contentBlocks = ch.content.content || [];
                    for (const block of contentBlocks) {
                        if (block.type === 'paragraph') {
                            const text = block.content ? block.content.map((c: Record<string, unknown>) => typeof c.text === 'string' ? c.text : '').join('') : '';
                            docChildren.push(new Paragraph({
                                text: text,
                                spacing: { after: 200 }
                            }));
                        }
                    }
                }

                docChildren.push(new Paragraph({ text: '', pageBreakBefore: true })); // break per chapter
            }

            const doc = new Document({
                sections: [{
                    properties: {},
                    children: docChildren,
                }]
            });

            const buffer = await Packer.toBuffer(doc);

            const headers = new Headers();
            headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            headers.set('Content-Disposition', `attachment; filename="${fallbackTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_manuscript.docx"`);

            return new Response(buffer as unknown as BodyInit, { status: 200, headers });
        }

        return new Response('Unsupported format', { status: 400 });

    } catch (e: unknown) {
        console.error("Export Error:", e);
        return new Response((e as Error).message, { status: 500 });
    }
}
