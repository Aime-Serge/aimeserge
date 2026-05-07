-- Migration: Split Broadcasts into specialized Posts and Articles tables
-- Date: 2026-05-06

-- 1. Create the Articles table for long-form, block-based content
CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    cover_image_url TEXT,
    cover_image_alt TEXT,
    excerpt TEXT,
    body_content JSONB DEFAULT '[]', -- The structured Block JSON
    estimated_read_time INTEGER DEFAULT 1,
    status publication_status_enum DEFAULT 'DRAFT',
    author_id UUID REFERENCES auth.users(id),
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Create the Posts table (Refactoring the existing broadcasts concept)
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    text_content VARCHAR(3000), -- Strict LinkedIn-style limit
    media_type media_type_enum DEFAULT 'NONE',
    media_payload JSONB DEFAULT '{}',
    article_id UUID REFERENCES articles(id) ON DELETE SET NULL, -- Link post to article
    visibility visibility_enum DEFAULT 'ANYONE',
    comment_permissions comment_permission_enum DEFAULT 'ANYONE',
    hashtags TEXT[] DEFAULT '{}',
    category VARCHAR(50),
    views INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Migration: Transfer data from old 'broadcasts' to 'posts' and 'articles'
-- This logic assumes we want to preserve existing content
DO $$
DECLARE
    b_record RECORD;
    new_article_id UUID;
BEGIN
    FOR b_record IN SELECT * FROM broadcasts LOOP
        IF b_record.content_type = 'ARTICLE' THEN
            -- Create Article entry
            INSERT INTO articles (
                title, slug, cover_image_url, cover_image_alt, excerpt, body_content, estimated_read_time, status, created_at, updated_at
            ) VALUES (
                b_record.title, b_record.slug, b_record.cover_image_url, b_record.cover_image_alt, b_record.excerpt, b_record.body_blocks, b_record.estimated_read_time, b_record.status, b_record.created_at, b_record.updated_at
            ) RETURNING id INTO new_article_id;

            -- Create a Post entry that points to this Article
            INSERT INTO posts (
                text_content, article_id, category, views, shares, likes, created_at, hashtags
            ) VALUES (
                b_record.excerpt, new_article_id, b_record.category, b_record.views, b_record.shares, b_record.likes, b_record.created_at, b_record.hashtags
            );
        ELSE
            -- Just a standard Post
            INSERT INTO posts (
                text_content, media_type, media_payload, hashtags, category, views, shares, likes, created_at, visibility_restricted, comment_permissions
            ) VALUES (
                b_record.text_content, b_record.media_type, b_record.media_payload, b_record.hashtags, b_record.category, b_record.views, b_record.shares, b_record.likes, b_record.created_at, b_record.visibility_restricted, b_record.comment_permissions
            );
        END IF;
    END LOOP;
END $$;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 5. Policies
CREATE POLICY "Public articles are viewable by everyone" ON articles
    FOR SELECT USING (status = 'PUBLISHED');

CREATE POLICY "Public posts are viewable by everyone" ON posts
    FOR SELECT USING (true);

-- 6. Trigger for Article Read Time
CREATE OR REPLACE FUNCTION calculate_article_read_time()
RETURNS TRIGGER AS $$
DECLARE
    word_count INTEGER;
BEGIN
    -- Basic word count from JSON blocks (paragraphs and headings)
    SELECT SUM((n->'data'->>'text')::text ~* '\w+') INTO word_count
    FROM jsonb_array_elements(NEW.body_content) n
    WHERE n->>'type' IN ('paragraph', 'heading');
    
    NEW.estimated_read_time := CEIL(COALESCE(word_count, 0) / 200.0);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_calculate_article_read_time
BEFORE INSERT OR UPDATE ON articles
FOR EACH ROW EXECUTE FUNCTION calculate_article_read_time();

-- 7. Trigger for Article-to-Post Distribution
-- When an article is PUBLISHED, automatically create a post to announce it if one doesn't exist.
CREATE OR REPLACE FUNCTION distribute_article_to_feed()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE' AND OLD.status != 'PUBLISHED' AND NEW.status = 'PUBLISHED') OR
       (TG_OP = 'INSERT' AND NEW.status = 'PUBLISHED') THEN
        
        -- Only insert if not already linked (to avoid duplicates if someone toggles status)
        IF NOT EXISTS (SELECT 1 FROM posts WHERE article_id = NEW.id) THEN
            INSERT INTO posts (
                text_content, 
                article_id, 
                media_type, 
                media_payload, 
                category
            ) VALUES (
                NEW.excerpt, 
                NEW.id, 
                'EXTERNAL_LINK', 
                jsonb_build_object('ogTitle', NEW.title, 'ogImage', NEW.cover_image_url, 'ogDescription', NEW.excerpt),
                'Broadcast'
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_distribute_article
AFTER INSERT OR UPDATE ON articles
FOR EACH ROW EXECUTE FUNCTION distribute_article_to_feed();
