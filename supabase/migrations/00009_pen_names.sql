-- 00009_pen_names.sql
-- Create an author_profiles table to allow users to publish under multiple pen names

create table if not exists public.author_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  bio text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.author_profiles enable row level security;

-- Policies for author_profiles
create policy "Public can view any author profile" 
on public.author_profiles for select 
using (true);

create policy "Users can insert their own author profiles" 
on public.author_profiles for insert 
with check (auth.uid() = user_id);

create policy "Users can update their own author profiles" 
on public.author_profiles for update 
using (auth.uid() = user_id);

create policy "Users can delete their own author profiles" 
on public.author_profiles for delete 
using (auth.uid() = user_id);

-- Add pen_name_id to Books table
alter table public.books add column if not exists pen_name_id uuid references public.author_profiles(id) on delete set null;

-- Trigger for updated_at
create extension if not exists moddatetime schema extensions;
create trigger handle_author_profiles_updated_at before update on public.author_profiles 
for each row execute procedure extensions.moddatetime (updated_at);
