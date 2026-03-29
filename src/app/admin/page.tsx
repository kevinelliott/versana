import AdminDashboard from '@/components/admin/AdminDashboard';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Secure the admin panel
    if (!user && process.env.NODE_ENV !== 'development') {
        redirect('/');
    }

    // simplistic check, could also check DB
    const isAdmin = process.env.NODE_ENV === 'development' || user?.email?.includes('@versana.app') || user?.email?.includes('admin');

    if (!isAdmin) {
        redirect('/workspace');
    }

    return <AdminDashboard />;
}
