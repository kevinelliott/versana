-- MythosOS V8: Update RLS Policies for Team Workspaces

-- Workspaces
DROP POLICY IF EXISTS "Users can view own workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Users can update own workspaces" ON public.workspaces;

CREATE POLICY "Users can view own or shared workspaces" ON public.workspaces FOR SELECT USING (
    auth.uid() = user_id OR
    id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
);

CREATE POLICY "Users can update own or shared workspaces" ON public.workspaces FOR UPDATE USING (
    auth.uid() = user_id OR
    id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
);

-- Chapters
DROP POLICY IF EXISTS "Users can manage chapters of own workspaces" ON public.chapters;

CREATE POLICY "Users can fully manage chapters" ON public.chapters FOR ALL USING (
    workspace_id IN (SELECT id FROM public.workspaces WHERE user_id = auth.uid()) OR
    workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
);

CREATE POLICY "Users can view shared chapters" ON public.chapters FOR SELECT USING (
    workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
);

-- Lore Entries
DROP POLICY IF EXISTS "Users can manage lore of own workspaces" ON public.lore_entries;

CREATE POLICY "Users can fully manage lore" ON public.lore_entries FOR ALL USING (
    workspace_id IN (SELECT id FROM public.workspaces WHERE user_id = auth.uid()) OR
    workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
);

CREATE POLICY "Users can view shared lore" ON public.lore_entries FOR SELECT USING (
    workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
);

-- Books (From 00002_add_books_table.sql)
DROP POLICY IF EXISTS "Users can manage books of own workspaces" ON public.books;

CREATE POLICY "Users can fully manage shared books" ON public.books FOR ALL USING (
    workspace_id IN (SELECT id FROM public.workspaces WHERE user_id = auth.uid()) OR
    workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
);

CREATE POLICY "Users can view private shared books" ON public.books FOR SELECT USING (
    workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
);
