import { createClient, createAdminClient } from '@/lib/supabase/server';

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

        const { data: book, error } = await supabase
            .from('books')
            .update({
                ...(updates.title !== undefined ? { title: updates.title } : {}),
                ...(updates.blurb !== undefined ? { blurb: updates.blurb } : {}),
                ...(updates.cover_image_url !== undefined ? { cover_image_url: updates.cover_image_url } : {}),
                ...(updates.is_public !== undefined ? { is_public: updates.is_public } : {}),
                ...(updates.pen_name_id !== undefined ? { pen_name_id: updates.pen_name_id } : {}),
                ...(updates.target_word_count !== undefined ? { target_word_count: updates.target_word_count } : {}),
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return Response.json(book);
    } catch (error) {
        console.error('Update Book API Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
