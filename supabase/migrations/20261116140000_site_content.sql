-- Editable page content (Admin → Homepage sections). One JSON document per key,
-- e.g. 'homepage'. Until a row exists the site shows its built-in defaults.
-- Safe to run more than once.
CREATE TABLE IF NOT EXISTS public.site_content (
  key        TEXT PRIMARY KEY CHECK (key ~ '^[a-z0-9_-]{1,40}$'),
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read site content" ON public.site_content;
CREATE POLICY "Public read site content" ON public.site_content FOR SELECT USING (true);
-- No insert/update/delete policies: only the admin (service role) can write.
