-- Migration: 00003_remove_entity_type_check.sql
-- Goal: Remove the strict CHECK constraint on lore_entries.entity_type to allow dynamic AI classification

ALTER TABLE lore_entries DROP CONSTRAINT IF EXISTS lore_entries_entity_type_check;
