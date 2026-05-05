-- Migration: Support for Long-form Articles and Content Workflow Status
-- Date: 2026-05-06

-- 1. Create Enumerations for Content Type and Status
DO $$ BEGIN
    CREATE TYPE content_type_enum AS ENUM ('POST', 'ARTICLE');
    CREATE TYPE publication_status_enum AS ENUM ('DRAFT', 'SCHEDULED', 'PUBLISHED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Upgrade broadcasts table for Articles
ALTER TABLE broadcasts 
ADD COLUMN IF NOT EXISTS content_type content_type_enum DEFAULT 'POST',
ADD COLUMN IF NOT EXISTS status publication_status_enum DEFAULT 'PUBLISHED',
ADD COLUMN IF NOT EXISTS body_blocks JSONB DEFAULT '[]', -- Block-based structure for Articles
ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
ADD COLUMN IF NOT EXISTS cover_image_alt TEXT,
ADD COLUMN IF NOT EXISTS excerpt TEXT,
ADD COLUMN IF NOT EXISTS estimated_read_time INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- 3. Function to calculate read time (simplified: 200 words per minute)
CREATE OR REPLACE FUNCTION calculate_article_read_time()
RETURNS TRIGGER AS $$
DECLARE
    word_count INTEGER;
BEGIN
    IF NEW.content_type = 'ARTICLE' AND NEW.body_blocks IS NOT NULL THEN
        -- Basic word count from JSON blocks (paragraphs and headings)
        SELECT SUM((n->'data'->>'text')::text ~* '\w+') INTO word_count
        FROM jsonb_array_elements(NEW.body_blocks) n
        WHERE n->>'type' IN ('paragraph', 'heading');
        
        NEW.estimated_read_time := CEIL(COALESCE(word_count, 0) / 200.0);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger for read time
DROP TRIGGER IF EXISTS tr_calculate_read_time ON broadcasts;
CREATE TRIGGER tr_calculate_read_time
BEFORE INSERT OR UPDATE ON broadcasts
FOR EACH ROW EXECUTE FUNCTION calculate_article_read_time();

-- 5. Indexing for Search and Filtering
CREATE INDEX IF NOT EXISTS idx_broadcasts_type_status ON broadcasts (content_type, status);
CREATE INDEX IF NOT EXISTS idx_broadcasts_slug ON broadcasts (slug);
