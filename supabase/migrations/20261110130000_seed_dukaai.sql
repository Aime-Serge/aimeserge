-- Add DukaAI (business cost optimisation venture) as a featured project.
-- Safe to run more than once: it skips if the slug already exists.
-- Edit wording, dates and links later from /admin -> Projects.

INSERT INTO public.projects (
  slug, title, tagline, role, summary, description, tools, features, category,
  url, images, is_visible, is_current, start_date, end_date, contributors,
  association, featured, sort_order
) VALUES (
  'dukaai',
  'DukaAI',
  'Snap a photo of your sales notebook and get clear business records, debts and insights.',
  'Co-founder',
  'DukaAI helps small businesses and micro-finance institutions cut costs and make better decisions, starting from the handwritten notebooks they already use. Our team placed 2nd at Hacktoberfest Hack Day Kigali 2026.',
  'Most small shops in Rwanda keep sales and credit in a handwritten notebook. DukaAI reads a photo of that notebook, in Kinyarwanda, French or English, and turns it into digital records. Owners see their sales, who still owes them money, and simple insights to cut costs, without changing how they work. The same records give micro-finance institutions a clearer picture of a business before they lend. Built with Google''s Gemma 4 at Hacktoberfest Hack Day Kigali 2026, where we placed 2nd and moved on to the next phase.',
  ARRAY['Gemma 4', 'AI vision / handwriting recognition', 'Kinyarwanda · French · English'],
  ARRAY[
    'Turns a photo of a handwritten sales book into digital records',
    'Reads Kinyarwanda, French and English handwriting',
    'Tracks sales and outstanding customer debts',
    'Business insights to cut costs, and records micro-finance lenders can use'
  ],
  'Fintech · AI',
  'https://www.linkedin.com/posts/aimesergeukobizaba_dukaai-hacktoberfest2026-rwandatech-ugcPost-7524120431981752320-Hdyb/',
  ARRAY['/uploads/dukaai-thumbnail.svg'],
  TRUE, TRUE,
  '{"month":"","year":"2026"}'::jsonb,
  NULL,
  ARRAY['Aime Serge UKOBIZABA', 'Jean de Dieu', 'Potiphar Gaye Vaye', 'Ahourdet Donambi', 'Thierry Ndatimana'],
  'Hacktoberfest Hack Day Kigali 2026 · 2nd place',
  TRUE, 2
)
ON CONFLICT (slug) DO NOTHING;
