-- Migration: Upgrade Research Table for Professional Presentation
-- Date: 2026-05-05

-- 1. Identity Layer
ALTER TABLE research ADD COLUMN IF NOT EXISTS doi TEXT;
ALTER TABLE research ADD COLUMN IF NOT EXISTS authors JSONB DEFAULT '[]';
ALTER TABLE research ADD COLUMN IF NOT EXISTS funding TEXT;
ALTER TABLE research ADD COLUMN IF NOT EXISTS publication_date TIMESTAMPTZ DEFAULT NOW();

-- 2. Structure Layer
-- Stores IMRaD sections: [{ "id": "intro", "title": "Introduction", "content": "...", "order": 1 }]
ALTER TABLE research ADD COLUMN IF NOT EXISTS content JSONB DEFAULT '[]';
-- Stores Media Assets: [{ "url": "...", "caption": "...", "type": "image", "anchor_id": "intro" }]
ALTER TABLE research ADD COLUMN IF NOT EXISTS assets JSONB DEFAULT '[]';

-- 3. Discovery Layer
ALTER TABLE research ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE research ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';

-- 4. Interaction Layer
ALTER TABLE research ADD COLUMN IF NOT EXISTS citations INT DEFAULT 0;

-- 5. Update Citation Counter Function (if needed in future)
CREATE OR REPLACE FUNCTION increment_citations(row_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE research SET citations = citations + 1 WHERE id = row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
