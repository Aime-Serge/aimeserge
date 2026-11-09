-- Phase 2: one blog pipeline, editable profile, featured projects.
-- Safe to run more than once. Back up first (Supabase dashboard → Database → Backups).
-- Apply with: supabase db push   (or paste into the SQL editor)

-- ─────────────────────────────────────────────────────────────────────────
-- 1. Fix the read-time trigger.
--    The old version did SUM(text ~* '\w+'), i.e. SUM(boolean), which
--    Postgres rejects, so any article containing text failed to save.
-- ─────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION calculate_article_read_time()
RETURNS TRIGGER AS $$
DECLARE
    word_count INTEGER;
BEGIN
    SELECT COALESCE(SUM(
             COALESCE(array_length(regexp_split_to_array(btrim(
               regexp_replace(COALESCE(n->'data'->>'text', '') || ' ' ||
                              COALESCE((SELECT string_agg(i, ' ') FROM jsonb_array_elements_text(
                                         CASE WHEN jsonb_typeof(n->'data'->'items') = 'array'
                                              THEN n->'data'->'items' ELSE '[]'::jsonb END) i), ''),
                              '<[^>]+>', ' ', 'g')), '\s+'), 1), 0)), 0)
      INTO word_count
      FROM jsonb_array_elements(COALESCE(NEW.body_content, '[]'::jsonb)) n
     WHERE n->>'type' IN ('paragraph', 'heading', 'list', 'callout');

    NEW.estimated_read_time := GREATEST(1, CEIL(word_count / 200.0));
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────────────────────────────────────
-- 2. Articles get the fields the admin editor needs.
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Engineering',
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_articles_status_published ON articles (status, published_at DESC);

-- ─────────────────────────────────────────────────────────────────────────
-- 3. Rescue posts written with the old admin editor.
--    It saved to `broadcasts`, which the public blog never reads. Copy them
--    into `articles` as DRAFTS so you can review and publish each one.
--    `broadcasts` itself is kept (read-only legacy); drop it later if empty.
-- ─────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
              WHERE table_schema = 'public' AND table_name = 'broadcasts' AND column_name = 'content') THEN
    INSERT INTO articles (title, slug, excerpt, body_content, status, category, tags, created_at)
    SELECT b.title,
           trim(both '-' from lower(regexp_replace(b.title, '[^a-zA-Z0-9]+', '-', 'g'))),
           b.excerpt,
           COALESCE((
             SELECT jsonb_agg(jsonb_build_object(
                      'id', gen_random_uuid()::text,
                      'type', 'paragraph',
                      'data', jsonb_build_object('text', btrim(chunk))))
               FROM regexp_split_to_table(b.content, E'\\n\\s*\\n') AS chunk
              WHERE btrim(chunk) <> ''), '[]'::jsonb),
           'DRAFT',
           b.category,
           COALESCE(b.tags, '{}'),
           b.created_at
      FROM broadcasts b
     WHERE b.title IS NOT NULL
       AND b.content IS NOT NULL
       AND NOT EXISTS (
             SELECT 1 FROM articles a
              WHERE a.slug = trim(both '-' from lower(regexp_replace(b.title, '[^a-zA-Z0-9]+', '-', 'g'))));
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────
-- 4. Profile: one row that drives the homepage hero and CV link.
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profile (
    id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    headline TEXT NOT NULL,
    bio TEXT NOT NULL,
    location TEXT DEFAULT 'Kigali, Rwanda',
    open_to_work BOOLEAN DEFAULT TRUE,
    availability_note TEXT,
    cv_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO public.profile (id, headline, bio, location, open_to_work, availability_note, cv_url)
VALUES (
  1,
  'I build secure, reliable software, and add AI where it actually helps.',
  'I''m Aime Serge. I design and build web apps and APIs, keep them safe from common attacks, and add AI features like smart search and chat assistants.',
  'Kigali, Rwanda',
  TRUE,
  'Open to full-time roles and freelance projects',
  '/uploads/Aime_Serge_Ukobizaba_CV_01-3.pdf'
)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read profile" ON public.profile;
CREATE POLICY "Public read profile" ON public.profile FOR SELECT USING (true);
REVOKE INSERT, UPDATE, DELETE ON public.profile FROM anon;

-- ─────────────────────────────────────────────────────────────────────────
-- 5. Featured projects for the homepage, in a chosen order.
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_projects_featured ON public.projects (featured, sort_order);
