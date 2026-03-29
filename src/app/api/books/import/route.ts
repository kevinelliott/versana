import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
    try {
        let supabase = await createClient();

        // Auth Gate
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

        const body = await req.json();
        const { workspaceId, title, rawText } = body;

        if (!workspaceId || !rawText) {
            return new Response('Missing required fields: workspaceId or rawText', { status: 400 });
        }

        // 1. Create a new Book for the imported manuscript
        const { data: book, error: bookError } = await supabase
            .from('books')
            .insert({
                workspace_id: workspaceId,
                title: title || 'Imported Manuscript',
                blurb: 'Document imported by author.',
                cover_image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop',
                genre: 'Unspecified'
            })
            .select()
            .single();

        if (bookError || !book) {
            throw new Error(`Book creation failed: ${bookError?.message}`);
        }

        // 2. Parse the rawText into Chapter pieces
        // We'll use a regex that matches common chapter headers to split the text.
        // E.g. "# Chapter 1", "CHAPTER 1", "Chapter One", "***"
        const chapterRegex = /(?:\n|^)(?:#\s*Chapter\s+\d+|CHAPTER\s+\d+|Chapter\s+[A-Za-z0-9]+|\*\*\*+)[^\n]*(?:\n|$)/ig;
        
        // This splits the document, keeping the delimiters if we used capturing groups, 
        // but here we just split to grab content blocks. We should probably extract the titles too.
        // A better approach: 
        const lines = rawText.split('\n');
        let chapters = [];
        let currentChapterContent = '';
        let currentChapterTitle = 'Prologue / Default';
        let isFirstChapter = true;

        const headerPattern = /^(?:#\s*Chapter\s+\d+|CHAPTER\s+\d+|Chapter\s+[A-Za-z0-9]+|\*\*\*+)/i;

        for (const line of lines) {
            if (headerPattern.test(line.trim())) {
                // If we already have content, push the old chapter
                if (currentChapterContent.trim().length > 0 || !isFirstChapter) {
                    chapters.push({ title: currentChapterTitle, content: currentChapterContent.trim() });
                }
                currentChapterTitle = line.replace(/#/g, '').trim();
                currentChapterContent = '';
                isFirstChapter = false;
            } else {
                currentChapterContent += line + '\n';
            }
        }
        
        // Push the final chapter
        if (currentChapterContent.trim().length > 0) {
            chapters.push({ title: currentChapterTitle, content: currentChapterContent.trim() });
        }

        // Fallback if no chapters matched
        if (chapters.length === 0) {
            chapters.push({ title: 'Full Document', content: rawText });
        }

        // 3. Prepare bulk insert for chapters
        const chapterInserts = chapters.map((c, index) => {
            // Convert plain text paragraph string into a basic TipTap JSON format
            const paragraphs = c.content.split(/\n\s*\n/).filter((p: string) => p.trim().length > 0);
            
            const tipTapJson = {
                type: 'doc',
                content: paragraphs.map((p: string) => ({
                    type: 'paragraph',
                    content: [{ type: 'text', text: p.replace(/\n/g, ' ').trim() }]
                }))
            };

            return {
                workspace_id: workspaceId,
                book_id: book.id,
                title: c.title.substring(0, 255), // truncate title if too long
                content: tipTapJson,
                order_index: index
            };
        });

        const { data: insertedChapters, error: chaptersError } = await supabase
            .from('chapters')
            .insert(chapterInserts)
            .select();

        if (chaptersError) {
            throw new Error(`Chapter insertion failed: ${chaptersError.message}`);
        }

        return Response.json({ book, chapters: insertedChapters });

    } catch (error: unknown) {
        console.error('Import Document API Error:', error);
        return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
