-- Add "Personal Portfolio Website" from the resume's PROJECTS section as its
-- own aside entry alongside the existing 'professional-portfolio-ai-platform'
-- case study. Same underlying site, but this is the resume's lighter,
-- brand-focused framing of it (distinct role/description/thumbnail, and
-- links to the live site rather than the GitHub repo).

INSERT INTO public.projects (
  slug, title, tagline, role, summary, description, tools, features, category,
  url, images, is_visible, is_current, start_date, end_date, contributors, association
) VALUES (
  'personal-portfolio-website',
  'Personal Portfolio Website',
  'Personal brand platform showcasing projects, research, and professional experience.',
  'System Analyst, Front End & Backend Developer',
  'Working as system analyst, handling both front-end and backend development for this personal portfolio and brand platform.',
  'Ongoing system analysis, front-end, and backend development of this personal portfolio site, serving as a personal brand platform.',
  '{}', '{}', 'Full-Stack',
  'https://aimeserge.vercel.app/',
  ARRAY['/uploads/personal-portfolio-thumbnail.svg'],
  TRUE, TRUE,
  '{"month":"September","year":"2025"}'::jsonb,
  NULL,
  ARRAY['Aime Serge UKOBIZABA'],
  NULL
)
ON CONFLICT (slug) DO NOTHING;
