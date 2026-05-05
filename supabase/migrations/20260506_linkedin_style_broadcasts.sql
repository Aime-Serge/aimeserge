-- Migration: Upgrade Broadcasts to LinkedIn-Style Presentation Engine
-- Date: 2026-05-06

-- 1. Create Enumerations for Polymorphic Content
DO $$ BEGIN
    CREATE TYPE media_type_enum AS ENUM ('NONE', 'IMAGE', 'IMAGE_CAROUSEL', 'VIDEO', 'DOCUMENT', 'EXTERNAL_LINK');
    CREATE TYPE visibility_enum AS ENUM ('ANYONE', 'CONNECTIONS_ONLY', 'GROUP_ONLY');
    CREATE TYPE comment_permission_enum AS ENUM ('ANYONE', 'CONNECTIONS_ONLY', 'NO_ONE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Transform the broadcasts table
-- We keep existing columns but add the structural modules
ALTER TABLE broadcasts 
ADD COLUMN IF NOT EXISTS text_content TEXT,
ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS entities JSONB DEFAULT '[]', -- Mentions/Tags metadata
ADD COLUMN IF NOT EXISTS media_type media_type_enum DEFAULT 'NONE',
ADD COLUMN IF NOT EXISTS media_payload JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS visibility_restricted visibility_enum DEFAULT 'ANYONE',
ADD COLUMN IF NOT EXISTS comment_permissions comment_permission_enum DEFAULT 'ANYONE',
ADD COLUMN IF NOT EXISTS hashtags TEXT[] DEFAULT '{}';

-- 3. Migration Logic: Sync old 'content' to 'text_content' if empty
UPDATE broadcasts 
SET text_content = content, 
    media_type = CASE 
        WHEN video_url IS NOT NULL THEN 'VIDEO'::media_type_enum
        WHEN images IS NOT NULL AND array_length(images, 1) > 1 THEN 'IMAGE_CAROUSEL'::media_type_enum
        WHEN images IS NOT NULL AND array_length(images, 1) = 1 THEN 'IMAGE'::media_type_enum
        ELSE 'NONE'::media_type_enum
    END,
    media_payload = jsonb_build_object(
        'images', images,
        'video_url', video_url
    )
WHERE text_content IS NULL;

-- 4. Indices for Performance
CREATE INDEX IF NOT EXISTS idx_broadcasts_hashtags ON broadcasts USING GIN (hashtags);
CREATE INDEX IF NOT EXISTS idx_broadcasts_visibility ON broadcasts (visibility_restricted);
