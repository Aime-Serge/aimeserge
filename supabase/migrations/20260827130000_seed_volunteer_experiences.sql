-- Seed volunteering entries from the "VOLUNTEERING" sections of
-- public/uploads/AimeSergeUkobizabaResume.pdf, using the new VOLUNTEER
-- employment type added in the previous migration.

INSERT INTO organizations (name)
VALUES ('IEE Rwanda'), ('Rwanda Cancer Relief');

INSERT INTO experiences (
  company_id, title, employment_type, location_type,
  start_date, end_date, description
) VALUES
(
  (SELECT id FROM organizations WHERE name = 'IEE Rwanda'),
  'Teaching Assistant',
  'VOLUNTEER', 'ON_SITE',
  '2024-12-01', '2025-06-30',
  $vol1$Led and facilitated tech-integrated CPD sessions with IEE Rwanda, empowering teachers through innovative digital tools and leadership in competency-based education.$vol1$
),
(
  (SELECT id FROM organizations WHERE name = 'Rwanda Cancer Relief'),
  'Technical Lead Volunteer',
  'VOLUNTEER', 'ON_SITE',
  '2025-07-01', NULL,
  $vol2$Collaborated with Rwanda Cancer Relief to implement technology-driven solutions advancing cancer education, care, and accessibility.$vol2$
);
