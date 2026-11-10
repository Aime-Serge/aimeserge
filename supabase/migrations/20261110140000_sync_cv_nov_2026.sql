-- Sync the resume with the November 2026 CV.
-- Safe to run more than once.

-- 1. New role: Product Manager & Software Engineer at Z-Gate LTD (Aug 2026 - now)
INSERT INTO organizations (name)
SELECT 'Z-Gate LTD' WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE name = 'Z-Gate LTD');

INSERT INTO experiences (company_id, title, location, location_type, start_date, end_date, description)
SELECT o.id, 'Product Manager & Software Engineer', 'Kigali, Rwanda', 'ON_SITE', '2026-08-01', NULL,
       $zg$Own and maintain the product roadmap, aligned with business goals. Research customer needs and market trends. Work with engineering to improve features based on user feedback. Analyse sales data to guide product improvements and grow revenue.$zg$
  FROM organizations o
 WHERE o.name = 'Z-Gate LTD'
   AND NOT EXISTS (SELECT 1 FROM experiences e WHERE e.company_id = o.id AND e.start_date = '2026-08-01');

-- 2. University of Rwanda is no longer listed on the site.
DELETE FROM educations
 WHERE institution_id IN (SELECT id FROM organizations WHERE name = 'University of Rwanda');

-- 3. Certifications listed on the CV but missing from the site.
--    issue_date is required; years below are best estimates - correct in /admin if needed.
INSERT INTO certificates (name, provider, issue_date, description, issuer_id)
SELECT 'ALX Freelancer Academy', 'ALX Africa', '2025',
       'Freelancing skills: finding clients, scoping and pricing work, and delivering projects professionally.',
       (SELECT id FROM organizations WHERE name = 'ALX Africa')
 WHERE NOT EXISTS (SELECT 1 FROM certificates WHERE name = 'ALX Freelancer Academy');

INSERT INTO certificates (name, provider, issue_date, description, issuer_id)
SELECT 'AWS AI/ML Practical Challenge', 'AWS', '2026',
       'Hands-on AI/ML challenge completed as part of the AWS AI/ML Scholars programme.',
       (SELECT id FROM organizations WHERE name = 'AWS')
 WHERE NOT EXISTS (SELECT 1 FROM certificates WHERE name = 'AWS AI/ML Practical Challenge');
