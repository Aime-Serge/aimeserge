-- Positioning: innovator & founder, research for impact, safe builder.
-- Also rewrites old seeded text in plain language and removes claims that
-- can't be checked (see docs/CONTENT_GUIDE.md).
--
-- Safe to run more than once. Each UPDATE only touches rows that still hold
-- the old seeded wording, so anything already edited in /admin is left alone.

-- ─────────────────────────────────────────────────────────────────────────
-- 1. Homepage hero (profile)
-- ─────────────────────────────────────────────────────────────────────────
UPDATE public.profile
   SET headline = 'I find the risks that hold people back, research them, and build technology that fixes them.',
       bio = 'I''m Aime Serge, a software engineer and founder in Kigali. I study real problems in health, small business, climate and online safety, and turn what I learn into safe, simple tools for communities, people and organisations.',
       updated_at = now()
 WHERE id = 1
   AND headline = 'I build secure, reliable software, and add AI where it actually helps.';

-- ─────────────────────────────────────────────────────────────────────────
-- 2. Old case studies: plain language, no unverifiable numbers
--    (removes "1000+ monthly visitors", "A+", "zero-trust… penetration
--    testing", "-18% wait times", "94% accuracy" and similar)
-- ─────────────────────────────────────────────────────────────────────────
UPDATE public.projects
   SET title = 'Climate Change Data Analysis for East Africa (2000–2024)',
       tagline = 'Local climate evidence so farmers and planners can prepare for heat and unreliable rain.',
       summary = 'A self-designed study of 24 years of East African climate data, to show how fast the region is warming and how rainfall is changing.',
       description = $c$The problem: global climate models often hide the local changes that matter most to farmers, water managers and regional planners in East Africa.

What I did: I collected 24 years of climate data from NASA Earth Data and the World Bank Climate Portal. I used time-series models (seasonal ARIMA, which finds patterns that repeat each season) to study temperature and rainfall, and a machine-learning model (Random Forest) to see what drives CO₂ emissions. The whole pipeline is documented so others can check and extend it.

What I found: a sustained warming trend across the region, and rainfall in growing seasons that is becoming harder to predict.

Who it helps: farming communities and local planners who need local evidence, not just global averages, to plan crops, water and food security.$c$,
       features = ARRAY['Local temperature and rainfall trends', 'Seasonal patterns explained', 'Drivers of CO₂ emissions', 'Open, reproducible method'],
       url = COALESCE(NULLIF(url, ''), 'https://github.com/Aime-Serge/ClimateModelEA_Skeleton')
 WHERE slug = 'climate-modeling-east-africa'
   AND description LIKE '%**Situation:**%';

UPDATE public.projects
   SET title = 'Real-Time Data for Urban Transit in Kigali',
       tagline = 'A design study on using live bus data to cut waiting times and wasted trips in Kigali.',
       summary = 'A case study of the Flex Transport model: using live data from buses to predict demand and move buses to where people are waiting.',
       description = $u$The problem: in fast-growing cities like Kigali, buses often run on fixed schedules while demand changes through the day. Passengers wait, some buses run empty, and fuel is wasted.

What I did: I designed a system that collects location and passenger-count data from buses, sends it to the cloud as it happens (Google Cloud Pub/Sub and Dataflow), and uses forecasting to predict which routes will be busy, so the fleet can be moved ahead of demand.

Status: a design and feasibility study, not yet a deployed service.

Who it helps: commuters, who could wait less, and transport operators, who could run fewer empty trips.$u$,
       features = ARRAY['Live bus location and passenger counts', 'Forecasts of busy routes', 'Moving buses ahead of demand', 'Cloud data pipeline']
 WHERE slug = 'urban-mobility-iot'
   AND description LIKE '%**Situation:**%';

UPDATE public.projects
   SET tagline = 'This website: portfolio, blog and research, with AI search and chat.',
       summary = 'A fast, secure portfolio platform with an admin dashboard, a blog, AI search and an AI chat assistant that answers questions about my work.',
       description = $p$I designed and built this site end to end. Content is edited from a private admin dashboard, and pages are cached so they load quickly and cost little to run. Visitors can search everything in plain language and ask the AI assistant about my work. Security is built in: signed admin sessions, checks on everything people type in, rate limits, strict security headers and database access rules.$p$,
       features = ARRAY['AI search and chat', 'Admin dashboard', 'Blog with RSS feed', 'Database access rules', 'Security headers and rate limits', 'Contact form']
 WHERE slug = 'professional-portfolio-ai-platform'
   AND description LIKE '%monthly visitors%';

-- ─────────────────────────────────────────────────────────────────────────
-- 3. Certificates: fix the "Nonedegree" typo
-- ─────────────────────────────────────────────────────────────────────────
UPDATE public.certificates
   SET name = replace(name, 'Nonedegree', 'Non-degree')
 WHERE name LIKE '%Nonedegree%';

-- ─────────────────────────────────────────────────────────────────────────
-- 4. Experience: plain language, no percentages without a baseline or source.
--    If you can show where a number came from (a report, a dashboard),
--    add it back in /admin with that source.
-- ─────────────────────────────────────────────────────────────────────────
UPDATE experiences
   SET description = $a$Worked with cross-functional teams in ALX's tech community and delivered 15+ projects on deadline. Built and maintained responsive web applications, made back-end APIs faster, and ran security audits to find and fix weaknesses.$a$
 WHERE company_id = (SELECT id FROM organizations WHERE name = 'ALX Africa')
   AND title = 'Software Engineer'
   AND description LIKE '%user engagement by 98\%%';

UPDATE experiences
   SET description = $e$EF NEXUS builds AI-driven education for young people. I built responsive interface components, worked with UX designers on features that keep learners coming back, and introduced a design framework that made development faster.$e$
 WHERE company_id = (SELECT id FROM organizations WHERE name = 'EF NEXUS')
   AND description LIKE '%user experience by 95\%%';

UPDATE experiences
   SET description = $b$Built software that helped the team work more efficiently, shipped features with cross-functional teams, and designed user-friendly interfaces.$b$
 WHERE company_id = (SELECT id FROM organizations WHERE name = 'Bittwork Technology')
   AND description LIKE '%team efficiency by 30\%%';

UPDATE experiences
   SET description = $v$I represent ALX Ventures, ALX's programme for entrepreneurs and startups, in Rwanda. I build partnerships and run community outreach that bring more young innovators and founders into the ecosystem.$v$
 WHERE company_id = (SELECT id FROM organizations WHERE name = 'ALX Africa')
   AND title = 'ALX Ventures Rwanda Ambassador'
   AND description LIKE '%brand awareness by 40\%%';

UPDATE experiences
   SET description = $t$Led training sessions for teachers with IEE Rwanda on using digital tools in class and on competency-based teaching.$t$
 WHERE company_id = (SELECT id FROM organizations WHERE name = 'IEE Rwanda')
   AND description LIKE '%CPD sessions%';

UPDATE experiences
   SET description = $r$I lead technology work as a volunteer with Rwanda Cancer Relief, using digital tools to improve cancer education, care and access to services.$r$
 WHERE company_id = (SELECT id FROM organizations WHERE name = 'Rwanda Cancer Relief')
   AND description LIKE 'Collaborated with Rwanda Cancer Relief to implement technology-driven solutions%';
