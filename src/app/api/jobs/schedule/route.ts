import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// This is a naive async generic runner that runs in the background.
// In a true production environment, this would be an Upstash QStash webhook, Inngest function, or Celery worker.
async function mockBackgroundRunner(jobId: string, userId: string) {
    const supabase = createAdminClient();

    // 1. Mark as processing
    await supabase.from('background_jobs')
        .update({ status: 'processing', started_at: new Date().toISOString() })
        .eq('id', jobId);

    // 2. Simulate progressive work
    for (let i = 1; i <= 5; i++) {
        await new Promise(r => setTimeout(r, 2000)); // 2 sec sleep per tick

        await supabase.from('background_jobs')
            .update({ 
                progress_percent: i * 20, 
                progress_message: `Running step ${i} of 5... Analyzing data models.` 
            })
            .eq('id', jobId);
    }

    // 3. Complete job and potentially trigger a notification!
    await supabase.from('background_jobs')
        .update({ 
            status: 'completed', 
            progress_percent: 100, 
            progress_message: 'Analysis finalized.',
            completed_at: new Date().toISOString() 
        })
        .eq('id', jobId);

    // Give them a notification as a reward
    await supabase.from('notifications')
        .insert({
            user_id: userId,
            type: 'job_completed',
            title: 'Agent Workflow Complete',
            body: `Your background job has finished successfully.`,
            read_status: false
        });
}

export async function POST(req: Request) {
    try {
        let supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        let userId = user?.id;
        if (!userId && process.env.NODE_ENV === 'development') {
            userId = 'ea333780-a920-420d-a6c7-ccc7c04a5ae0';
        } else if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { jobType, workspaceId, payload } = body;

        // Insert job into queue
        const adminSupabase = createAdminClient();
        const { data: job, error } = await adminSupabase
            .from('background_jobs')
            .insert({
                user_id: userId,
                workspace_id: workspaceId,
                job_type: jobType,
                payload: payload || {},
                status: 'pending'
            })
            .select('id')
            .single();

        if (error || !job) {
            return NextResponse.json({ error: 'Failed to queue job' }, { status: 500 });
        }

        // Fire & Forget: We kick off the naive runner
        // Note: Next.js dev server might kill this if process exits, but it works for demo
        mockBackgroundRunner(job.id, userId).catch(console.error);

        return NextResponse.json({ jobId: job.id, message: 'Job scheduled successfully' });
    } catch (err: unknown) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
