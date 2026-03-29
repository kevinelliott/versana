-- MythosOS V10: Project Goals & Target Tracking

-- Add target_word_count for tracking progress rings and goal milestones
ALTER TABLE public.books
ADD COLUMN IF NOT EXISTS target_word_count INTEGER DEFAULT 50000;
