import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = createAdminClient();

        // In a real app we'd verify the requesting user is an admin.
        // For this demo, we bypass or assume they are.

        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching admin users:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ users: data });
    } catch (err: any) {
        console.error('Admin API error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
