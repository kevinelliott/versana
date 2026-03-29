-- Add target_date to books for goal tracking
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS target_date DATE;

-- Create word_count_logs table for gamification and velocity tracking
CREATE TABLE IF NOT EXISTS public.word_count_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    daily_words_written INTEGER DEFAULT 0,
    total_words INTEGER DEFAULT 0,
    mana_spent INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(book_id, log_date)
);

-- RLS for word_count_logs
ALTER TABLE public.word_count_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own word count logs" 
    ON public.word_count_logs FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.books b
            JOIN public.workspaces w ON b.workspace_id = w.id
            LEFT JOIN public.workspace_members wm ON w.id = wm.workspace_id
            WHERE b.id = word_count_logs.book_id
            AND (w.user_id = auth.uid() OR wm.user_id = auth.uid())
        )
    );

CREATE POLICY "Users can insert their own word count logs" 
    ON public.word_count_logs FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.books b
            JOIN public.workspaces w ON b.workspace_id = w.id
            LEFT JOIN public.workspace_members wm ON w.id = wm.workspace_id
            WHERE b.id = word_count_logs.book_id
            AND (w.user_id = auth.uid() OR wm.user_id = auth.uid())
        )
    );

CREATE POLICY "Users can update their own word count logs" 
    ON public.word_count_logs FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.books b
            JOIN public.workspaces w ON b.workspace_id = w.id
            LEFT JOIN public.workspace_members wm ON w.id = wm.workspace_id
            WHERE b.id = word_count_logs.book_id
            AND (w.user_id = auth.uid() OR wm.user_id = auth.uid())
        )
    );
