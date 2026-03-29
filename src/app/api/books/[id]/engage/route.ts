import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const bookId = params.id;
        if (!bookId || bookId === 'undefined') return NextResponse.json({ error: 'invalid book' }, { status: 400 });

        const body = await req.json();
        const type = body.type; // 'view' | 'like'
        
        const supabase = createAdminClient();

        // Primitive optimistic increment (Susceptible to race conditions at extreme scale, suitable for V6 MVP)
        const { data: book } = await supabase.from('books').select('total_views, total_likes').eq('id', bookId).single();
        if (!book) return NextResponse.json({ error: 'not found' }, { status: 404 });

        if (type === 'view') {
            await supabase.from('books').update({ total_views: (book.total_views || 0) + 1 }).eq('id', bookId);
        } else if (type === 'like') {
            await supabase.from('books').update({ total_likes: (book.total_likes || 0) + 1 }).eq('id', bookId);
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
