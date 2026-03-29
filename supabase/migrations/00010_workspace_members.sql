-- MythosOS V8: Co-Authoring & Team Workspaces

-- Enum for Roles
CREATE TYPE workspace_role AS ENUM ('owner', 'editor', 'commenter', 'viewer');

-- Table: workspace_members
CREATE TABLE IF NOT EXISTS public.workspace_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role workspace_role NOT NULL DEFAULT 'viewer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(workspace_id, user_id)
);

-- Trigger for updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.workspace_members
  FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime (updated_at);

-- RLS Policies
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- 1. Owners can see and edit members of their workspaces
-- 2. Members can see who else is in the workspace
CREATE POLICY "Users can see members of their shared workspaces"
    ON public.workspace_members FOR SELECT
    USING (
        auth.uid() IN (
            SELECT m.user_id FROM public.workspace_members m WHERE m.workspace_id = workspace_members.workspace_id
        ) OR
        auth.uid() IN (
            SELECT w.user_id FROM public.workspaces w WHERE w.id = workspace_members.workspace_id
        )
    );

CREATE POLICY "Owners can manage workspace members"
    ON public.workspace_members FOR ALL
    USING (
        auth.uid() IN (
            SELECT w.user_id FROM public.workspaces w WHERE w.id = workspace_members.workspace_id
        ) OR
        auth.uid() IN (
            SELECT m.user_id FROM public.workspace_members m WHERE m.workspace_id = workspace_members.workspace_id AND m.role = 'owner'
        )
    );

-- Backfill existing workspaces by setting the owner as an explicit member
INSERT INTO public.workspace_members (workspace_id, user_id, role)
SELECT id, user_id, 'owner'::workspace_role FROM public.workspaces
ON CONFLICT DO NOTHING;
