-- Add a column to workspaces to store Phase 2 planning state (Kanban, Character Nodes, etc)
alter table public.workspaces add column if not exists board_state jsonb default '{}'::jsonb;
