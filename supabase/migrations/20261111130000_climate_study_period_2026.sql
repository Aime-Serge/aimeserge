-- The climate study covers 2000–2026 (title previously said 2000–2024).
-- Safe to run more than once.
BEGIN;
UPDATE public.projects
   SET title = replace(title, '2000–2024', '2000–2026')
 WHERE slug = 'climate-modeling-east-africa'
   AND title LIKE '%2000–2024%';
UPDATE public.research
   SET title = replace(title, '2000–2024', '2000–2026')
 WHERE title LIKE '%2000–2024%';
COMMIT;
