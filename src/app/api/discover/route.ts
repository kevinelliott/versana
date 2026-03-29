import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const runtime = 'edge';
// Revalidate this endpoint every 60 seconds. Caching public responses globally!
export const revalidate = 60;

export async function GET() {
    try {
        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from('books')
            .select(`
                id, title, blurb, cover_image_url, 
                author_profiles ( id, name ),
                workspaces!inner ( 
                    genre, 
                    users ( id, full_name )
                )
            `)
            .eq('is_public', true)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formatted = (data || []).map((b: any) => ({
            id: b.id,
            title: b.title || 'Untitled Work',
            blurb: b.blurb || 'A mind-bending journey awaits...',
            cover_image_url: b.cover_image_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
            genre: b.workspaces?.genre || 'Fiction',
            author_id: b.author_profiles?.id || b.workspaces?.users?.id || 'unknown',
            author_name: b.author_profiles?.name || b.workspaces?.users?.full_name || 'Versana Author'
        }));

        return NextResponse.json(formatted);
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}
