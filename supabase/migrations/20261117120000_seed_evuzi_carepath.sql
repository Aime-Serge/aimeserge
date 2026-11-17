-- Add E-Vuzi CarePath (referral-loop venture, discovery stage) as a featured project.
-- Safe to run more than once: an existing row (e.g. edited in the admin) is left alone.

INSERT INTO public.projects (
  slug, title, tagline, role, summary, description, tools, features, category,
  url, images, is_visible, is_current, start_date, end_date, contributors,
  association, featured, sort_order
) VALUES (
  'evuzi-carepath',
  'E-Vuzi CarePath',
  'Making sure that when a patient is referred, the result and next steps come back to the health worker who sent them.',
  'Founder · Product & Engineering Lead',
  'A health venture to close referral loops in Rwanda''s primary health care: it works inside the national digital systems instead of replacing them, and is built only once field evidence proves the gap.',
  $ev$The problem: in Rwanda, community health workers send patients to health centres and hospitals. The national referral guidelines (2020) say the facility must then send the result and the next steps back, a message called a counter-referral. The evidence shows this return trip is rarely recorded: in one audit of 11 Kigali facilities, the counter-referral part of the form was filled in only 3.9% of the time. Without it, the health worker can't follow the patient up at home.

Our approach: Rwanda already has strong digital health systems, including electronic records for community health workers (cEMR), a digital screening tool, facility records, national reporting and the National Health Intelligence Center. So E-Vuzi CarePath will not be another app, patient record, screening tool or dashboard. First, with the teams that run these systems, we check whether referrals still fail to close today. Only if that gap is real will we build a small add-on that works inside the existing systems.

What it would do: when a referral is missing a step (the patient isn't recorded as arriving, the facility hasn't sent feedback, or a follow-up is overdue), it shows the case to the person already responsible for it. The case closes only when the existing system records the missing step. It uses simple rules that anyone can check, not AI. It never makes clinical decisions or delays emergency care, and health workers never re-type what they have already entered.

Built responsibly: health data is sensitive under Rwanda's data protection law (N°058/2021). We use only made-up test data until the data owner, legal basis, hosting and approvals are in place. Even then, it keeps the minimum: the referral number and which steps have happened, never clinical notes.

How we'll know it works: compared with a baseline measured first, how many referrals get feedback, how quickly it comes back, how many follow-ups are completed, and how many extra minutes it adds to health workers' days.

Status: discovery. There is no code yet and no partnership is confirmed. The first 30 days: walk through today's referral workflow with the people who run it, interview health workers and facility staff, and review a sample of anonymised referral records. Then we decide to build, partner, offer an implementation service, or stop. The evidence behind it is my scoping review, "Closing the Referral Loop", on the Research page.$ev$,
  ARRAY[
    'Product discovery',
    'Service design',
    'Rule-based workflows (no AI)',
    'Health data standards (FHIR, DHIS2)',
    'Privacy by design'
  ],
  ARRAY[
    'Finds referrals missing a step: arrival, feedback or follow-up',
    'Sends each case to the person already responsible for it',
    'Works inside Rwanda''s existing systems: no new app or patient record',
    'Simple, checkable rules; no AI and no clinical decisions',
    'Never delays emergency care; falls back to phone or paper',
    'Made-up test data only until every approval is in place'
  ],
  'Health · Product',
  '/research/referral-loop-rwanda',
  ARRAY[
    '/uploads/evuzi-carepath-thumbnail.svg'
  ],
  TRUE, TRUE,
  '{"month":"November","year":"2026"}'::jsonb,
  NULL,
  ARRAY[
    'Aime Serge UKOBIZABA',
    'Joseph Nsabimana'
  ],
  'Co-founded venture · Rwanda primary health care',
  TRUE, 5
)
ON CONFLICT (slug) DO NOTHING;

-- Keep the order: Sentinel 4, E-Vuzi CarePath 5, Second Look 6, this portfolio site 7.
UPDATE public.projects SET sort_order = 7
 WHERE slug = 'professional-portfolio-ai-platform' AND sort_order = 6;
UPDATE public.projects SET sort_order = 6
 WHERE slug = 'second-look' AND sort_order = 5;
