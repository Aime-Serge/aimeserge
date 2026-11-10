-- Add INEZA AI (founder, since March 2026) and Innovation Hacks internship
-- (22 Aug - 22 Sep 2026) to Experience. Safe to run more than once.

INSERT INTO organizations (name)
SELECT v.name FROM (VALUES ('INEZA AI'), ('Innovation Hacks')) AS v(name)
 WHERE NOT EXISTS (SELECT 1 FROM organizations o WHERE o.name = v.name);

INSERT INTO experiences (company_id, title, location, location_type, start_date, end_date, description)
SELECT o.id, 'Founder & Product Manager', 'Kigali, Rwanda', 'ON_SITE', '2026-03-01', NULL,
       $in$Founded INEZA AI, a health venture building an AI-assisted health management system for Rwanda's clinics, with my partner Bahati Pierre, under ALU's Center for Health Innovation and Impact (CHII) and the Africa Health Collaborative. I lead product: roadmap, user research with health workers, and the prototype.$in$
  FROM organizations o
 WHERE o.name = 'INEZA AI'
   AND NOT EXISTS (SELECT 1 FROM experiences e WHERE e.company_id = o.id AND e.start_date = '2026-03-01');

INSERT INTO experiences (company_id, title, employment_type, start_date, end_date, description)
SELECT o.id, 'Full-stack Developer Intern', 'INTERNSHIP', '2026-08-22', '2026-09-22',
       $ih$Built front-end and back-end features as a full-stack developer intern at Innovation Hacks.$ih$
  FROM organizations o
 WHERE o.name = 'Innovation Hacks'
   AND NOT EXISTS (SELECT 1 FROM experiences e WHERE e.company_id = o.id AND e.start_date = '2026-08-22');
