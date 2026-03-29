-- MythosOS V8: Document Snapshots & Version Control

CREATE TABLE IF NOT EXISTS public.chapter_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    snapshot_note TEXT DEFAULT 'Auto-save',
    content JSONB,
    yjs_state BYTEA,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.chapter_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can fully manage their team snapshots" ON public.chapter_snapshots FOR ALL USING (
    workspace_id IN (SELECT id FROM public.workspaces WHERE user_id = auth.uid()) OR
    workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
);

CREATE POLICY "Users can view team snapshots" ON public.chapter_snapshots FOR SELECT USING (
    workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
);
