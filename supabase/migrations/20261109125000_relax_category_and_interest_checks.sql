-- Fix two fixed-value rules from the first schema that newer content breaks.
-- Runs before the November seeds, which depend on it. Safe to run more than once.
--
-- 1. projects.category only allowed AI / Security / Cloud / Full-Stack /
--    Software Engineering. Projects now use labels like "Health · AI" and
--    "Safety · AI · IoT", so those inserts failed. Category becomes free text.
-- 2. contacts.interest didn't allow the contact form's current topics
--    ("Freelance project", "Partnership or investment", "Research collaboration"),
--    so those messages were rejected. Old values stay valid for existing rows.

DO $$
DECLARE c record;
BEGIN
  FOR c IN
    SELECT con.conname, rel.relname
      FROM pg_constraint con
      JOIN pg_class rel ON rel.oid = con.conrelid
      JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
     WHERE nsp.nspname = 'public'
       AND con.contype = 'c'
       AND ((rel.relname = 'projects' AND pg_get_constraintdef(con.oid) ILIKE '%category%')
         OR (rel.relname = 'contacts' AND pg_get_constraintdef(con.oid) ILIKE '%interest%'))
  LOOP
    EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT %I', c.relname, c.conname);
  END LOOP;
END $$;

ALTER TABLE public.projects
  ADD CONSTRAINT projects_category_not_blank CHECK (length(trim(category)) BETWEEN 1 AND 60);

ALTER TABLE public.contacts
  ADD CONSTRAINT contacts_interest_check CHECK (interest IN (
    'Hiring', 'Freelance project', 'Partnership or investment', 'Research collaboration', 'Other',
    'Collaboration', 'Consultation', 'Research'
  ));
