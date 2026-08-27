-- Sync experiences/educations/certificates with the updated resume
-- (Aime_Serge_Ukobizaba_CV_01-3.pdf), which extends employment dates,
-- adds new roles, adds a university enrollment, and gives explicit dates
-- for training programs that previously lacked them (so they can now be
-- recorded as certificates without fabricating information).

-- 1. Update existing experiences whose end dates/titles changed
UPDATE experiences
SET title = 'Software Engineer',
    end_date = '2026-02-28',
    description = $upd1$Tech-driven community. Collaborated with cross-functional teams to deliver 15+ projects within deadlines. Developed and maintained responsive web applications increasing user engagement by 98%. Optimized backend APIs improving data retrieval speed by 15%. Enhanced system security, reducing vulnerabilities by 60% through audits. Developed scalable applications, boosting user engagement by 30%.$upd1$
WHERE company_id = (SELECT id FROM organizations WHERE name = 'ALX Africa')
  AND start_date = '2025-01-01';

UPDATE experiences
SET title = 'Software Developer',
    end_date = '2025-12-31',
    description = $upd2$Empowering youth-innovative and AI-driven education toward world-class education. Developed responsive UI components enhancing user experience by 95% at EF NEXUS. Collaborated with UX designers to implement features that increased retention by 75%. Led integration of new design frameworks reducing development time by 65%. Developed high-performance applications, boosting user engagement by 30%. Collaborated with cross-functional teams, driving project success rates up 40%.$upd2$
WHERE company_id = (SELECT id FROM organizations WHERE name = 'EF NEXUS')
  AND start_date = '2025-07-01';

-- 2. Fill in precise education dates + grade now given by the new resume
UPDATE educations
SET start_date = '2021-09-01',
    end_date = '2024-06-30',
    grade = '3.67/4.0',
    description = $edu1$Graduated with honors. Completed Embedded and Robotics BootCamp.$edu1$
WHERE institution_id = (SELECT id FROM organizations WHERE name = 'Ecole Secondaire Bumbogo');

-- 3. New organizations
INSERT INTO organizations (name)
VALUES ('Bittwork Technology'), ('University of Rwanda'), ('Google'), ('AWS');

-- 4. New experiences
INSERT INTO experiences (
  company_id, title, employment_type, location, location_type,
  start_date, end_date, description
) VALUES
(
  (SELECT id FROM organizations WHERE name = 'Bittwork Technology'),
  'Software Engineering Intern', 'INTERNSHIP', NULL, DEFAULT,
  '2025-10-01', '2025-12-31',
  $exp3$Developed innovative software solutions, boosting team efficiency by 30%. Collaborated on cross-functional teams, enhancing project delivery speed. Designed user-friendly interfaces, increasing user satisfaction ratings.$exp3$
),
(
  (SELECT id FROM organizations WHERE name = 'ALX Africa'),
  'ALX Ventures Rwanda Ambassador', 'PART_TIME', 'Kigali, Rwanda', 'ON_SITE',
  '2026-04-01', NULL,
  $exp4$Cultivated strategic partnerships to drive business growth in Rwanda. Led initiatives that increased brand awareness by 40% in target markets. Facilitated community outreach, resulting in a 25% increase in participation.$exp4$
);

-- 5. New education
INSERT INTO educations (
  institution_id, degree, start_date, end_date, description
) VALUES (
  (SELECT id FROM organizations WHERE name = 'University of Rwanda'),
  'BS in Computer Science (Hons)',
  '2025-10-01', '2029-06-30',
  $edu2$Completed a capstone project on AI algorithms, earning top accolades. Participated in coding competitions, securing 1st place in regional events.$edu2$
);

-- 6. Certificates (now have explicit provider + issue/expiry dates)
INSERT INTO certificates (name, provider, issue_date, expiration_date, description, issuer_id)
VALUES
(
  'Nonedegree in Agentic Engineering', 'AWS', '2026-04', NULL,
  $cert1$AWS AI/ML Scholars program (USA). Completed advanced projects in autonomous systems design. Developed innovative solutions for real-world engineering challenges. Collaborated on interdisciplinary research with industry professionals.$cert1$,
  (SELECT id FROM organizations WHERE name = 'AWS')
),
(
  'Nonedegree Certification in Software Engineering', 'ALX Africa', '2025-01', '2026-02-28',
  $cert2$Nairobi, Kenya. Developed 12 full-stack applications as capstone projects. Gained proficiency in multiple programming languages, software engineering methodologies, and agile team frameworks. Achieved top 1% in final assessments among East African participants.$cert2$,
  (SELECT id FROM organizations WHERE name = 'ALX Africa')
),
(
  'Nonedegree Certificate in Cybersecurity', 'ALX Africa', '2026-01', '2026-05-31',
  $cert3$Kigali, Rwanda. Completed hands-on projects simulating real-world cyber threats. Earned certification in ethical hacking and network security. Achieved top 10% ranking in cybersecurity coursework.$cert3$,
  (SELECT id FROM organizations WHERE name = 'ALX Africa')
),
(
  'Certification in Professional Foundations', 'ALX Africa', '2025-01', '2025-04-30',
  $cert4$Kigali, Rwanda. Achieved top 5% ranking in cohort for comprehensive assessments. Gained professional skills in workplace frameworks and digital-age skills required by the tech industry.$cert4$,
  (SELECT id FROM organizations WHERE name = 'ALX Africa')
),
(
  'Certifications and Skill Badges in Cloud Computing', 'Google', '2025-10', '2026-02-28',
  $cert5$USA. Earned skill badges demonstrating expertise in cloud architecture. Completed advanced coursework in cloud security and management. Participated in hands-on projects enhancing practical cloud skills.$cert5$,
  (SELECT id FROM organizations WHERE name = 'Google')
);
