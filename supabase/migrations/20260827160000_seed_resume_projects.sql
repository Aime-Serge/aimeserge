-- Seed the smaller projects listed in the resume's "PROJECTS" section that
-- weren't yet in the projects table. ("Personal Portfolio Website" from the
-- resume is this same site as the existing 'professional-portfolio-ai-platform'
-- case study, so it's intentionally not duplicated here.)

INSERT INTO public.projects (
  slug, title, tagline, role, summary, description, tools, features, category,
  url, images, is_visible, is_current, start_date, end_date, contributors, association
) VALUES
(
  'iglotours',
  'IGLO Tours',
  'System analysis and front-end development with serverless API integration for a travel booking platform.',
  'System Analyst & Front End Developer',
  'Contributed system analysis and front-end development work, including serverless API integration, for the iglotours.com travel platform.',
  'Worked as system analyst and front-end developer on iglotours.com, integrating serverless APIs to support the platform''s booking and brand experience.',
  '{}', '{}', 'Full-Stack',
  'https://www.iglotours.com',
  ARRAY['/uploads/iglotours-thumbnail.svg'],
  TRUE, FALSE,
  '{"month":"July","year":"2025"}'::jsonb,
  '{"month":"August","year":"2025"}'::jsonb,
  ARRAY['Aime Serge UKOBIZABA'],
  'Norrsken'
),
(
  'airbnb-booking-management-system',
  'AirBnB Booking Management System',
  'A booking management system built as hands-on training with ALX Rwanda.',
  'System Analyst & Front End Developer',
  'Built system analysis and front-end components for an Airbnb-style booking management system as part of ALX Rwanda training.',
  'Worked as system analyst and front-end developer on an Airbnb-style booking management system, completed as hands-on experience during ALX Rwanda training.',
  '{}', '{}', 'Software Engineering',
  NULL,
  ARRAY['/uploads/airbnb-booking-thumbnail.svg'],
  TRUE, FALSE,
  '{"month":"April","year":"2025"}'::jsonb,
  '{"month":"April","year":"2025"}'::jsonb,
  ARRAY['Aime Serge UKOBIZABA'],
  'ALX Rwanda'
),
(
  'ecommerce-online-store-platform',
  'E-Commerce / Online Store Platform',
  'Front-end development and API integration for an e-commerce storefront.',
  'Front End Developer & API Integration',
  'Developed front-end features and integrated APIs for an e-commerce/online store platform.',
  'Worked as front-end developer handling API integration for an e-commerce/online store platform, spanning Kigali and Nairobi.',
  '{}', '{}', 'Full-Stack',
  NULL,
  ARRAY['/uploads/ecommerce-thumbnail.svg'],
  TRUE, FALSE,
  '{"month":"August","year":"2025"}'::jsonb,
  '{"month":"August","year":"2025"}'::jsonb,
  ARRAY['Aime Serge UKOBIZABA'],
  NULL
)
ON CONFLICT (slug) DO NOTHING;
