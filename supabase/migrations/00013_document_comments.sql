-- MythosOS V9: Document Comments & Collaborative Annotations

CREATE TABLE IF NOT EXISTS public.document_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    from_pos INTEGER NOT NULL,
    to_pos INTEGER NOT NULL,
    highlighted_text TEXT,
    comment_body TEXT NOT NULL,
    resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger for updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.document_comments
  FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime (updated_at);

-- RLS
ALTER TABLE public.document_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can fully manage comments within their team" ON public.document_comments FOR ALL USING (
    workspace_id IN (SELECT id FROM public.workspaces WHERE user_id = auth.uid()) OR
    workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid() AND role IN ('owner', 'editor', 'commenter'))
);

CREATE POLICY "Users can view comments within their team" ON public.document_comments FOR SELECT USING (
    workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
);
