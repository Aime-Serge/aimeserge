-- Add the Global marketplace (electronics delivery, Rwanda -> East Africa -> global)
-- as an ongoing, featured project. Safe to run more than once.
-- The code repository is private, so no public link is set. Add a demo URL in /admin when one exists.

INSERT INTO public.projects (
  slug, title, tagline, role, summary, description, tools, features, category,
  url, images, is_visible, is_current, start_date, end_date, contributors,
  association, featured, sort_order
) VALUES (
  'global-electronics-marketplace',
  'Global: Electronics Marketplace and Delivery Network',
  'Getting genuine electronics from verified sellers to buyers across Rwanda, then East Africa, with clear prices and delivery times.',
  'Product & Engineering Lead',
  'An online marketplace and delivery system for electronics. It starts in Rwanda, expands across East Africa, and is built to go global. In development: the core system is built, and a Rwanda pilot is next.',
  $g$The problem: buying a phone, laptop or solar kit online is risky. Buyers often can't tell if a seller or product is genuine, don't know the real delivery cost or time until late, and face extra duties and paperwork when goods cross a border. Sellers struggle to know where to keep stock so it reaches customers quickly.

What is built so far: sellers are checked before they can list products. Stock is tracked in each warehouse, and the system estimates the delivery price and time from the nearest warehouse that has the item. Logistics staff follow every shipment on one dashboard. Payments are designed for Mobile Money and bank transfer, with prices shown in Rwandan francs and other East African currencies. The site supports Kinyarwanda, Swahili, French and English, and has AI search that understands plain questions.

What's next:
1. Rwanda pilot: Kigali warehouses, an electronics catalogue, Mobile Money payments, delivery estimates based on real roads, and receipts that meet Rwanda Revenue Authority rules.
2. East Africa: add East African Community customs and tax rules, cross-border delivery partners, and payment held safely until the buyer receives the goods.
3. Global: international suppliers and shipping partners, on the same system.

Who it helps: buyers who want genuine products at a clear price; electronics shops that want to reach customers beyond their own street; and communities outside the main cities that find good electronics hard to get.

Status: in development. No sales or delivery figures yet; results will be published once the pilot runs.$g$,
  ARRAY['Next.js', 'Django', 'PostgreSQL', 'Redis', 'Docker', 'Gemini AI'],
  ARRAY[
    'Verified sellers before any product is listed',
    'Delivery price and time from the nearest warehouse with stock',
    'One dashboard to track every shipment',
    'Mobile Money and bank transfer, prices in local currencies',
    'Kinyarwanda, Swahili, French and English',
    'AI product search in plain language'
  ],
  'E-commerce · Logistics',
  NULL,
  ARRAY['/uploads/global-marketplace-thumbnail.svg'],
  TRUE, TRUE,
  '{"month":"April","year":"2026"}'::jsonb,
  NULL,
  ARRAY['Aime Serge UKOBIZABA'],
  'Ongoing venture · Rwanda → East Africa → global',
  TRUE, 3
)
ON CONFLICT (slug) DO NOTHING;

-- Keep three ventures on the homepage: move this website project to 4th,
-- unless its order was already changed in /admin.
UPDATE public.projects
   SET sort_order = 4
 WHERE slug = 'professional-portfolio-ai-platform'
   AND sort_order = 3;
