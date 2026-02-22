import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const workspaceId = searchParams.get('workspaceId');

        if (!workspaceId) {
            return new Response('Workspace ID required', { status: 400 });
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

        const { data: lore, error } = await supabase
            .from('lore_entries')
            .select('id, entity_name, aliases, entity_type, synopsis, status')
            .eq('workspace_id', workspaceId);

        if (error) throw error;

        // Format to match the frontend LORE_DATABASE structure
        const formattedLore = (lore || []).map(e => ({
            id: e.id,
            name: e.entity_name,
            aliases: e.aliases || [],
            type: e.entity_type,
            synopsis: e.synopsis,
            status: e.status
        }));

        return Response.json(formattedLore);
    } catch (error) {
        console.error('Fetch Lore API Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
