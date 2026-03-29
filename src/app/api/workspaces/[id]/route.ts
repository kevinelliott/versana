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

        const updatePayload: Record<string, string> = {
            updated_at: new Date().toISOString()
        };

        if (updates.name !== undefined) updatePayload.name = updates.name;
        if (updates.genre !== undefined) updatePayload.genre = updates.genre;
        if (updates.custom_instructions !== undefined) updatePayload.custom_instructions = updates.custom_instructions;

        const { data: workspace, error } = await supabase
            .from('workspaces')
            .update(updatePayload)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return Response.json(workspace);
    } catch (error) {
        console.error('Update Workspace API Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
