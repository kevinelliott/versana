-- Create books table to represent individual projects/books under a workspace (universe)
create table if not exists public.books (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  title text not null,
  genre text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.books enable row level security;

-- Policies for books
create policy "Users can manage books of own workspaces" on public.books
  for all using (
    workspace_id in (select id from public.workspaces where user_id = auth.uid())
  );

-- Alter chapters to link to books
alter table public.chapters add column if not exists book_id uuid references public.books(id) on delete cascade;

-- Data migration: Create a default book for each existing workspace
insert into public.books (id, workspace_id, title)
select gen_random_uuid(), id, name || ' (Book 1)' from public.workspaces
where not exists (select 1 from public.books where workspace_id = public.workspaces.id);

-- Update existing chapters to point to the newly created book for their workspace
update public.chapters c
set book_id = b.id
from public.books b
where c.workspace_id = b.workspace_id and c.book_id is null;

-- Make book_id required for chapters going forward
-- Note: We do this after the update so it doesn't fail on existing data
alter table public.chapters alter column book_id set not null;
