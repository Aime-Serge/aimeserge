-- Migration: Expand projects metadata for timeline and visibility controls
-- Date: 2026-05-06

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS is_current BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS start_date JSONB,
ADD COLUMN IF NOT EXISTS end_date JSONB,
ADD COLUMN IF NOT EXISTS contributors TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS association TEXT;

UPDATE projects
SET is_visible = TRUE
WHERE is_visible IS NULL;

UPDATE projects
SET contributors = '{}'
WHERE contributors IS NULL;
