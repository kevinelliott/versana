import { createClient, createAdminClient } from '@/lib/supabase/server';

// Get a specific chapter (full content)
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
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

        const { data: chapter, error } = await supabase
            .from('chapters')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        return Response.json(chapter);
    } catch (error) {
        console.error('Fetch Chapter API Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}

// Update a chapter (title or content)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
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

        const updates = await req.json();

        // Calculate a rough word count if content is updated
        if (updates.content) {
            // Rough plain text extraction. In a real app we'd traverse the TipTap JSON tree
            const stringified = JSON.stringify(updates.content);
            const textContent = stringified.replace(/<[^>]*>?/gm, ''); // simple strip tags if HTML
            const words = textContent.split(/\s+/).length;
            updates.word_count = words;
        }

        updates.updated_at = new Date().toISOString();

        const { data: chapter, error } = await supabase
            .from('chapters')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return Response.json(chapter);
    } catch (error) {
        console.error('Update Chapter API Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
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

        const { error } = await supabase
            .from('chapters')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return new Response(null, { status: 204 });
    } catch (error) {
        console.error('Delete Chapter API Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
