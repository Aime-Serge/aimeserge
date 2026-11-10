-- Add DukaAI (Co-Founder & UX Analyst) to Experience, and match the role on
-- the DukaAI project. Start month is an estimate (Hack Day Kigali, Oct 2026):
-- correct it in /admin if needed. Safe to run more than once.

INSERT INTO organizations (name)
SELECT 'DukaAI' WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE name = 'DukaAI');

INSERT INTO experiences (company_id, title, location, location_type, start_date, end_date, description)
SELECT o.id, 'Co-Founder & UX Analyst', 'Kigali, Rwanda', 'ON_SITE', '2026-10-01', NULL,
       $dk$Co-founded DukaAI, which turns photos of handwritten sales notebooks (Kinyarwanda, French or English) into digital records, debt tracking and business insights for small shops and micro-finance lenders. I lead UX: researching how shop owners keep records today and designing a flow that fits how they already work. Our team placed 2nd at Hacktoberfest Hack Day Kigali 2026.$dk$
  FROM organizations o
 WHERE o.name = 'DukaAI'
   AND NOT EXISTS (SELECT 1 FROM experiences e WHERE e.company_id = o.id);

UPDATE public.projects
   SET role = 'Co-Founder & UX Analyst'
 WHERE slug = 'dukaai';
