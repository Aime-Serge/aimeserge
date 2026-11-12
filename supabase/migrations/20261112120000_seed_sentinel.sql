-- Add Sentinel (fire-safety and occupancy monitoring for venues) as a featured project.
-- Safe to run more than once. The GitHub repo is private, so no public link yet.

INSERT INTO public.projects (
  slug, title, tagline, role, summary, description, tools, features, category,
  url, images, is_visible, is_current, start_date, end_date, contributors,
  association, featured, sort_order
) VALUES (
  'sentinel',
  'Sentinel',
  'Warns venue staff early about smoke and overcrowding, and keeps proof the venue stayed safe between inspections.',
  'Founder & Lead Engineer',
  'An offline, privacy-first safety monitor for hotels, bars and churches in Rwanda: it watches for smoke, counts people against the venue''s safe limit, and records a safety history for inspectors and insurers.',
  $sn$The problem: hotels, bars and churches in Rwanda are checked for fire safety about once a year. Between inspections, nothing checks everyday risks such as a crowd above the venue's safe limit, or smoke in a room no one is watching. When something goes wrong, there is also no record showing what happened.

What I built: a small box installed at the venue that works even when the internet is down. It looks at each camera picture for smoke and warns staff only when it sees smoke twice in a row, to avoid false alarms. If a camera is covered or too dark, it says so instead of showing "all clear". Sensors at each door count people in and out and compare the total with the safe limit on the venue's certificate: "nearly full" at 90%, "over capacity" above 100%. Alerts appear on a dashboard that works on a phone, and go out by SMS and email; messages that can't be sent wait in a queue until the connection comes back. Every alert and staff action is saved, so the venue can show inspectors and insurers it stayed safe over time.

Built responsibly: Sentinel is not a fire alarm. It runs alongside the venue's certified alarm and never replaces it. Pictures never leave the building, and ordinary pictures are deleted within seconds. When an alert picture is kept, every person in it is blurred first; if blurring fails, the whole picture is blurred. There is no face recognition. Each staff member has their own login and role, saved records are deleted automatically on a schedule, and the venue owner can show or delete a guest's data on request, as Rwanda's data protection law (N°058/2021) requires.

Status: the full system works end to end in the lab, with simulated cameras and door sensors, and 293 automated tests run on every change. Before a first pilot venue (planned for early 2027), the smoke detector still needs training on real venue pictures collected with consent, the door sensors need testing on real hardware, and the privacy and security reviews need to be signed off.$sn$,
  ARRAY[
    'Python',
    'PyTorch',
    'OpenCV',
    'Streamlit',
    'SQLite',
    'Raspberry Pi',
    'IoT sensors',
    'pytest',
    'GitHub Actions'
  ],
  ARRAY[
    'Early smoke warning that checks twice before raising an alert',
    'Live people count against the venue''s safe limit',
    'Works offline; alerts wait in a queue until the internet is back',
    'People blurred in every saved picture; no face recognition',
    'Phone-friendly dashboard with a login and role for each staff member',
    'Safety history for inspections and insurance'
  ],
  'Safety · AI · IoT',
  NULL,
  ARRAY['/uploads/sentinel-thumbnail.svg'],
  TRUE, TRUE,
  '{"month":"September","year":"2026"}'::jsonb,
  NULL,
  ARRAY['Aime Serge UKOBIZABA'],
  'Independent Venture · Public safety',
  TRUE, 4
)
ON CONFLICT (slug) DO NOTHING;

-- Keep the order: Sentinel 4, Second Look 5, this portfolio site 6.
UPDATE public.projects SET sort_order = 6
 WHERE slug = 'professional-portfolio-ai-platform' AND sort_order = 5;
UPDATE public.projects SET sort_order = 5
 WHERE slug = 'second-look' AND sort_order = 4;
