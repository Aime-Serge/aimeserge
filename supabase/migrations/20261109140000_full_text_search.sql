-- Phase 3: free, instant site search with Postgres full-text search.
-- Replaces the Gemini embedding call that /api/v1/search made on every query.
-- Apply with: supabase db push   (or paste into the SQL editor)

-- Searchable text per table, weighted: A = title, B = summary, C = tags, D = body.
CREATE OR REPLACE FUNCTION public.search_site(q TEXT, max_results INT DEFAULT 8)
RETURNS TABLE (id TEXT, kind TEXT, title TEXT, snippet TEXT, href TEXT, tags TEXT[], rank REAL)
LANGUAGE sql STABLE
SET search_path = public
AS $$
  WITH query AS (
    SELECT websearch_to_tsquery('simple', q) AS tsq
  ),
  docs AS (
    SELECT p.id::text, 'project'::text AS kind, p.title,
           coalesce(p.tagline, p.summary, '') AS summary,
           '/projects/' || p.slug AS href,
           coalesce(p.tools, '{}') AS tags,
           setweight(to_tsvector('simple', coalesce(p.title, '')), 'A') ||
           setweight(to_tsvector('simple', coalesce(p.tagline, '') || ' ' || coalesce(p.summary, '')), 'B') ||
           setweight(to_tsvector('simple', array_to_string(coalesce(p.tools, '{}'), ' ')), 'C') ||
           setweight(to_tsvector('simple', coalesce(p.description, '')), 'D') AS doc
      FROM projects p
     WHERE coalesce(p.is_visible, true)
    UNION ALL
    SELECT r.id::text, 'research', r.title,
           coalesce(r.abstract, ''),
           '/research/' || r.slug,
           coalesce(r.tags, '{}'),
           setweight(to_tsvector('simple', coalesce(r.title, '')), 'A') ||
           setweight(to_tsvector('simple', coalesce(r.abstract, '')), 'B') ||
           setweight(to_tsvector('simple', array_to_string(coalesce(r.tags, '{}'), ' ')), 'C')
      FROM research r
    UNION ALL
    SELECT a.id::text, 'blog', a.title,
           coalesce(a.excerpt, ''),
           '/blog/' || a.slug,
           coalesce(a.tags, '{}'),
           setweight(to_tsvector('simple', coalesce(a.title, '')), 'A') ||
           setweight(to_tsvector('simple', coalesce(a.excerpt, '')), 'B') ||
           setweight(to_tsvector('simple', array_to_string(coalesce(a.tags, '{}'), ' ')), 'C') ||
           setweight(to_tsvector('simple', coalesce(
             (SELECT string_agg(coalesce(b->'data'->>'text', ''), ' ')
                FROM jsonb_array_elements(coalesce(a.body_content, '[]'::jsonb)) b), '')), 'D')
      FROM articles a
     WHERE a.status = 'PUBLISHED'
  )
  SELECT d.id, d.kind, d.title, left(d.summary, 180), d.href, d.tags,
         ts_rank(d.doc, query.tsq) AS rank
    FROM docs d, query
   WHERE d.doc @@ query.tsq
      -- Prefix match on the title so "next" finds "Next.js" while typing.
      OR d.title ILIKE '%' || q || '%'
   ORDER BY rank DESC, d.title
   LIMIT greatest(1, least(max_results, 20));
$$;

-- Callable by the server (service role) only; the API route rate-limits visitors.
REVOKE ALL ON FUNCTION public.search_site(TEXT, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.search_site(TEXT, INT) TO service_role;
