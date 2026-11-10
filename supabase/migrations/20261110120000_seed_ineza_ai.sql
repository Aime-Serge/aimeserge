-- Add INEZA AI (health venture) as a featured project.
-- Safe to run more than once: it skips if the slug already exists.
-- Edit wording, dates and links later from /admin -> Projects.

INSERT INTO public.projects (
  slug, title, tagline, role, summary, description, tools, features, category,
  url, images, is_visible, is_current, start_date, end_date, contributors,
  association, featured, sort_order
) VALUES (
  'ineza-ai',
  'INEZA AI',
  'A health management system with an AI assistant, built for Rwanda''s clinics and care teams.',
  'Founder · Product & Engineering',
  'INEZA AI is a health venture I founded and am building with my partner Bahati Pierre, under ALU''s Center for Health Innovation and Impact (CHII), as part of the Mastercard Foundation''s Africa Health Collaborative.',
  'INEZA AI brings patients, appointments, pharmacy stock and disease trends into one place, with an AI assistant that answers questions for each role: doctor, nurse, pharmacist and administrator. We are building it in Kigali with ALU''s Center for Health Innovation and Impact (CHII), part of the Africa Health Collaborative. The current prototype runs on sample data. Next: test it with health workers, add Kinyarwanda, and build it to meet Rwanda''s data protection law, which treats health data as sensitive.',
  ARRAY['Next.js', 'TypeScript', 'AI chat API (role-based prompts)', 'Vercel'],
  ARRAY[
    'Role-based dashboards for doctors, nurses, pharmacists and administrators',
    'Patients, appointments and pharmacy stock in one system',
    'Disease trends and alerts by district',
    'AI assistant with voice input, tailored to each role'
  ],
  'Health · AI',
  'https://v0-ineza-ai.vercel.app/',
  ARRAY['/uploads/ineza-ai-thumbnail.svg'],
  TRUE, TRUE,
  '{"month":"March","year":"2026"}'::jsonb,
  NULL,
  ARRAY['Aime Serge UKOBIZABA', 'Pierre BAHATI'],
  'ALU Center for Health Innovation and Impact (CHII) · Africa Health Collaborative',
  TRUE, 1
)
ON CONFLICT (slug) DO NOTHING;
