import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function GET() {
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
        const { data: workspaceData, error } = await supabase
            .from('workspaces')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is no rows returned
            throw error;
        }

        let workspace = workspaceData;

        if (!workspace) {
            // Signal to the frontend that this user has no workspaces
            // and needs to go through the First-Time Onboarding Flow.
            return Response.json({ noWorkspaces: true });
        }

        return Response.json(workspace);
    } catch (error: unknown) {
        console.error('Active Workspace API Error:', error);
        return new Response(JSON.stringify({ error: (error as Error).message, stack: (error as Error).stack }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
