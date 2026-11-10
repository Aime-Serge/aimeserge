-- 1. Z-Gate LTD: the role is Assistant Product Manager.
UPDATE experiences
   SET title = 'Assistant Product Manager'
 WHERE company_id = (SELECT id FROM organizations WHERE name = 'Z-Gate LTD')
   AND title = 'Product Manager & Software Engineer';

-- 2. ALX Africa: the software engineering role ended in February 2026.
--    Matches by title, not start date, so it also catches rows edited in /admin.
--    The ALX Ventures Rwanda Ambassador role is unaffected.
UPDATE experiences
   SET end_date = '2026-02-28'
 WHERE company_id = (SELECT id FROM organizations WHERE name = 'ALX Africa')
   AND (title ILIKE '%engineer%' OR title ILIKE '%developer%')
   AND (end_date IS NULL OR end_date > '2026-02-28');
