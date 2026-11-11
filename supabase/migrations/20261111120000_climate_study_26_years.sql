-- The climate study covers 26 years of East African data (was written as 24).
-- Safe to run more than once.
BEGIN;
UPDATE public.projects
   SET summary     = replace(summary, '24 years', '26 years'),
       description = replace(description, '24 years', '26 years')
 WHERE slug = 'climate-modeling-east-africa'
   AND (summary LIKE '%24 years%' OR description LIKE '%24 years%');
COMMIT;
