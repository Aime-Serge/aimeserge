-- Add Second Look (phishing risk checker) as a featured project.
-- Safe to run more than once. The GitHub repo is private, so no public link yet.

INSERT INTO public.projects (
  slug, title, tagline, role, summary, description, tools, features, category,
  url, images, is_visible, is_current, start_date, end_date, contributors,
  association, featured, sort_order
) VALUES (
  'second-look',
  'Second Look',
  'Paste a suspicious email and get a plain-language verdict on whether it''s phishing, and why.',
  'Designer & Developer',
  'A phishing risk checker for people who aren''t security experts: it explains which warning signs it found, and only keeps a record when the user agrees.',
  $sl$The problem: phishing emails trick people into giving away passwords and money by copying trusted brands and creating panic. Most people can't tell a fake "PayPal" or "bank" email from a real one, and the tools that can are built for IT teams.

What I built: a web app where you paste an email and get a clear verdict (likely phishing or likely safe) with the warning signs behind it, in plain words. It checks for sender addresses that imitate a known brand (like paypa1.com), a display name that claims a brand the address doesn't match, a reply-to address that goes somewhere else, links that hide behind raw IP addresses or link shorteners, and pressure language like "verify within 24 hours".

Built responsibly: nothing is stored unless the user ticks a consent box, and even then the subject line is only kept as a fingerprint (hash), never as text. Users can report a wrong verdict; reports are reviewed by a person instead of retraining the model automatically, so one bad click can't quietly make it worse. A missed phishing email is treated as worse than a false alarm.

Status: a working, tested prototype (14 automated tests). It runs on a rule-based checker today, and includes the pipeline to train a machine-learning model on public phishing datasets before a pilot with real users, which waits on mentor review and pilot consent.$sl$,
  ARRAY['Python', 'Flask', 'scikit-learn', 'SQLite', 'pytest'],
  ARRAY[
    'Plain-language verdict with the warning signs it found',
    'Spots look-alike brand domains and mismatched senders',
    'Flags hidden links and pressure language',
    'Consent before anything is stored; subject lines kept only as a hash',
    'Users can report a wrong verdict for human review'
  ],
  'Security · AI',
  NULL,
  ARRAY['/uploads/second-look-thumbnail.svg'],
  TRUE, TRUE,
  '{"month":"August","year":"2026"}'::jsonb,
  NULL,
  ARRAY['Aime Serge UKOBIZABA'],
  'Independent Project · Online safety',
  TRUE, 4
)
ON CONFLICT (slug) DO NOTHING;

-- Keep this portfolio site right after it in the featured order.
UPDATE public.projects SET sort_order = 5
 WHERE slug = 'professional-portfolio-ai-platform' AND sort_order = 4;
