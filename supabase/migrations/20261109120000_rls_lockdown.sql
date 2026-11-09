-- RLS lockdown: closes direct REST access with the public anon key.
--
-- Before this, contacts, knowledge, projects, research, certificates and
-- broadcasts had no Row-Level Security, so anyone holding the anon key could
-- read every contact message and insert, update or delete site content
-- through https://<project>.supabase.co/rest/v1/...
--
-- The app's server code uses the service-role key, which bypasses RLS, so
-- nothing in the app breaks. Public visitors keep read access to published
-- content only.
--
-- Apply with:  supabase db push   (or paste into the Supabase SQL editor)

-- 1. Private tables: no policies at all = no anon/authenticated access.
ALTER TABLE IF EXISTS public.contacts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.knowledge ENABLE ROW LEVEL SECURITY;

-- 2. Public content: read-only for everyone, writes only via the server.
ALTER TABLE IF EXISTS public.projects     ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.research     ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.broadcasts   ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read visible projects" ON public.projects;
CREATE POLICY "Public read visible projects" ON public.projects
  FOR SELECT USING (coalesce(is_visible, true));

DROP POLICY IF EXISTS "Public read research" ON public.research;
CREATE POLICY "Public read research" ON public.research FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read certificates" ON public.certificates;
CREATE POLICY "Public read certificates" ON public.certificates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read broadcasts" ON public.broadcasts;
CREATE POLICY "Public read broadcasts" ON public.broadcasts FOR SELECT USING (true);

-- 3. Belt and braces: anon may never write to any of these tables.
REVOKE INSERT, UPDATE, DELETE ON
  public.contacts, public.knowledge, public.projects,
  public.research, public.certificates, public.broadcasts
FROM anon;
REVOKE SELECT ON public.contacts, public.knowledge FROM anon;
