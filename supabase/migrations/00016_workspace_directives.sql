-- MythosOS V10: AI Workspace Directives

-- Add a column to allow authors to define strict global rules for the AI within a universe
ALTER TABLE public.workspaces
ADD COLUMN IF NOT EXISTS custom_instructions TEXT;

-- Drop and recreate the API view if necessary, though direct table reads are fine.
-- Example instruction: "You are writing Grimdark Fantasy. Under no circumstances should characters use modern slang."
