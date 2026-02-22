import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = await params;
        if (!id) return NextResponse.json({ error: 'Missing workspace ID' }, { status: 400 });

        const body = await req.json();
        const { board_state } = body;

        let supabase = createClient();
        let { data: { user } } = await supabase.auth.getUser();

        // Local dev bypass
        if (!user && process.env.NODE_ENV === 'development') {
            supabase = createAdminClient();
            user = { id: 'ea333780-a920-420d-a6c7-ccc7c04a5ae0' } as any;
        }

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data, error } = await supabase
            .from('workspaces')
            .update({ board_state })
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) {
            console.error("Supabase update error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (err: any) {
        console.error("Error updating board state:", err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
