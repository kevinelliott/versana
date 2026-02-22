import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
    try {
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

        // Get the most recently created workspace
        let { data: workspace, error } = await supabase
            .from('workspaces')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is no rows returned
            throw error;
        }

        if (!workspace) {
            // Create a default workspace if none exists
            const { data: newWorkspace, error: createError } = await supabase
                .from('workspaces')
                .insert({
                    user_id: userId,
                    name: 'The Obsidian Crown',
                    genre: 'Sci-Fi Fantasy'
                })
                .select()
                .single();

            if (createError) throw createError;
            workspace = newWorkspace;
        }

        return Response.json(workspace);
    } catch (error: any) {
        console.error('Active Workspace API Error:', error);
        return new Response(JSON.stringify({ error: error.message, stack: error.stack }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
