-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS TABLE
create table public.users (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  subscription_tier text default 'free' check (subscription_tier in ('free', 'pro', 'master')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- WORKSPACES TABLE (Projects)
create table public.workspaces (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  description text,
  genre text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CHAPTERS / MANUSCRIPT DOCUMENTS
create table public.chapters (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  title text not null,
  content jsonb default '{}'::jsonb, -- TipTap document state
  word_count integer default 0,
  order_index integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- LORE BIBLE ENTRIES (Context Matrix text descriptions)
create table public.lore_entries (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  entity_name text not null,
  aliases text[],
  entity_type text check (entity_type in ('character', 'place', 'lore', 'plot', 'rule')),
  synopsis text not null,
  status text,
  first_appearance uuid references public.chapters(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CONTEXT MATRIX EMBEDDINGS (pgvector)
create table public.context_embeddings (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  lore_entry_id uuid references public.lore_entries(id) on delete cascade,
  chapter_id uuid references public.chapters(id) on delete cascade,
  content text not null, -- The actual text chunk that was embedded
  embedding vector(1536), -- Assuming OpenAI text-embedding-3-small or fast GPT-4o embeddings
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- API COST TRACKING (Admin Analytics)
create table public.api_usage_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  model_used text not null,
  prompt_tokens integer default 0,
  completion_tokens integer default 0,
  total_cost_usd numeric,
  action_type text, -- e.g. 'auto-tag', 'beat-to-scene', 'cover-gen'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Setup RLS (Row Level Security)

-- Users can only read/update their own profile
alter table public.users enable row level security;
create policy "Users can view own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);

-- Workspaces isolation
alter table public.workspaces enable row level security;
create policy "Users can view own workspaces" on public.workspaces for select using (auth.uid() = user_id);
create policy "Users can insert own workspaces" on public.workspaces for insert with check (auth.uid() = user_id);
create policy "Users can update own workspaces" on public.workspaces for update using (auth.uid() = user_id);
create policy "Users can delete own workspaces" on public.workspaces for delete using (auth.uid() = user_id);

-- Chapters restricted to workspace owner
alter table public.chapters enable row level security;
create policy "Users can manage chapters of own workspaces" on public.chapters
  for all using (
    workspace_id in (select id from public.workspaces where user_id = auth.uid())
  );

-- Lore Entries restricted to workspace owner
alter table public.lore_entries enable row level security;
create policy "Users can manage lore of own workspaces" on public.lore_entries
  for all using (
    workspace_id in (select id from public.workspaces where user_id = auth.uid())
  );

-- Context Embeddings restricted to workspace owner
alter table public.context_embeddings enable row level security;
create policy "Users can manage embeddings of own workspaces" on public.context_embeddings
  for all using (
    workspace_id in (select id from public.workspaces where user_id = auth.uid())
  );

-- API Cost Tracking (Read-only for users, Insert by API only)
alter table public.api_usage_logs enable row level security;
create policy "Users can view own api stats" on public.api_usage_logs for select using (auth.uid() = user_id);

-- PGVECTOR SEARCH FUNCTION
-- This RPC matches similarities but strictly isolates to the current workspace
create or replace function match_context_embeddings (
  query_embedding vector(1536),
  target_workspace_id uuid,
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  lore_entry_id uuid,
  chapter_id uuid,
  content text,
  similarity float
)
language sql stable
as $$
  select
    context_embeddings.id,
    context_embeddings.lore_entry_id,
    context_embeddings.chapter_id,
    context_embeddings.content,
    1 - (context_embeddings.embedding <=> query_embedding) as similarity
  from context_embeddings
  where context_embeddings.workspace_id = target_workspace_id
    and 1 - (context_embeddings.embedding <=> query_embedding) > match_threshold
  order by context_embeddings.embedding <=> query_embedding
  limit match_count;
$$;
