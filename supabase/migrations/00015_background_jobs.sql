-- MythosOS V9: Agentic Background Processing Jobs

CREATE TABLE IF NOT EXISTS public.background_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    job_type TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    payload JSONB DEFAULT '{}'::jsonb,
    result JSONB,
    error_message TEXT,
    progress_percent INTEGER DEFAULT 0,
    progress_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- RLS
ALTER TABLE public.background_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own jobs" ON public.background_jobs FOR ALL USING (
    user_id = auth.uid()
);

-- Realtime Setup
ALTER TABLE public.background_jobs REPLICA IDENTITY FULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'background_jobs'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.background_jobs;
    END IF;
END $$;
