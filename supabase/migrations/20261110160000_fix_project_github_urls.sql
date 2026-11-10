-- The initial seed linked projects to github.com/AimeSerge, which is a
-- different (empty) GitHub account. The real account is Aime-Serge.
-- ClimateModelEA was also renamed to ClimateModelEA_Skeleton.

UPDATE public.projects
SET url = 'https://github.com/Aime-Serge/aimeserge'
WHERE slug = 'professional-portfolio-ai-platform'
  AND url = 'https://github.com/AimeSerge/aimeserge';

UPDATE public.projects
SET url = 'https://github.com/Aime-Serge/ClimateModelEA_Skeleton'
WHERE slug = 'climate-modeling-east-africa'
  AND url = 'https://github.com/AimeSerge/ClimateModelEA';

UPDATE public.projects
SET url = 'https://github.com/Aime-Serge'
WHERE slug = 'urban-mobility-iot'
  AND url = 'https://github.com/AimeSerge';
