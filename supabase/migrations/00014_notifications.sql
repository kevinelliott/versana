-- MythosOS V9: Notification Hub

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('invite', 'mention', 'job_completed', 'system')),
    title TEXT NOT NULL,
    body TEXT,
    action_url TEXT,
    read_status BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own notifications" ON public.notifications FOR ALL USING (
    user_id = auth.uid()
);

-- Realtime Setup
-- Enable replica identity full so realtime gets old/new blocks
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Publish notifications table to the postgres_changes 'graphql' and 'realtime' publication
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notifications'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    END IF;
END $$;
