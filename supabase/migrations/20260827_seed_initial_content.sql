-- Seed initial content for the projects table (moved from the static
-- fallback in src/core/domain/portfolio/constants.ts) and the resume
-- relational tables (organizations/experiences/educations), sourced from
-- public/uploads/AimeSergeUkobizabaResume.pdf.

-- 1. Projects
INSERT INTO public.projects (
  slug, title, tagline, role, summary, description, tools, features, category,
  url, views, likes, images, is_visible, is_current, start_date, end_date,
  contributors, association
) VALUES
(
  'climate-modeling-east-africa',
  'Computational Modeling and Environmental Data Analysis for Climate Change Assessment in East Africa (2000–2024)',
  'Data-driven climate trends analysis supporting agricultural resilience across Sub-Saharan Africa.',
  'Lead Researcher & Developer',
  'A self-designed research project applying time-series modeling and machine learning to analyze 24 years of East African climate data, identifying warming trends and rainfall variability.',
  $desc1$
**Situation:** East Africa faces increasing vulnerability to climate change, yet global climate models often obscure local variation critical for regional planning and agricultural adaptation strategies.

**Task:** Design and execute a computational analysis of regional environmental data to provide localized, interpretable insights into climate trends affecting agriculture and water resources.

**Action:**
- Collected and preprocessed 24 years of historical climate data from NASA Earth Data and World Bank Climate Portal
- Implemented Seasonal ARIMA time-series analysis to examine temperature trends and rainfall variability
- Applied Random Forest regression to model CO₂ emissions patterns and identify driving factors
- Built transparent, reproducible data pipelines using Python and GCP Cloud Storage for scalability
- Documented methodology and findings to support peer review and extension by other researchers

**Result:**
- Identified sustained regional warming trend: 24.02°C (2000) → 25.29°C (2024)
- Revealed increasing rainfall unpredictability and variability in agricultural growing seasons
- Established interpretable models that complement global forecasts with local context
- Created foundation for "ClimateModelIA Regulator Project"—a climate prediction and agricultural decision-support system for Sub-Saharan region
- Published research with full code transparency and reproducibility

**Impact:** Provides data-driven evidence for agricultural adaptation planning in climate-vulnerable regions.
  $desc1$,
  ARRAY['Python','ARIMA','Random Forest','GCP','Data Engineering','PostgreSQL'],
  ARRAY['Time-series analysis','Machine learning modeling','Environmental data processing','Interpretable insights','Cloud pipelines','Reproducible research'],
  'AI',
  'https://github.com/AimeSerge/ClimateModelEA',
  234, 48,
  ARRAY['/uploads/climate-research-thumbnail.svg'],
  TRUE, TRUE,
  '{"month":"September","year":"2024"}'::jsonb,
  '{"month":"November","year":"2025"}'::jsonb,
  ARRAY['Aime Serge UKOBIZABA'],
  'Independent Research'
),
(
  'urban-mobility-iot',
  'Real-Time Telemetry and Predictive Redistribution in Urban Transit',
  'IoT-powered fleet optimization reducing commute times and operational waste in Kigali transit.',
  'Technical Researcher & Systems Designer',
  'A case study of the Flex Transport model integrating IoT telemetry from bus fleets into real-time cloud data processing pipelines for commuter optimization in Kigali, Rwanda.',
  $desc2$
**Situation:** Urban transportation in rapidly growing African cities like Kigali faces significant inefficiency: buses run with inconsistent schedules, real-time passenger information is unavailable, and fleet redistribution is reactive rather than predictive. This leads to passenger wait times, operational waste, and poor user experience.

**Task:** Design and implement a real-time data pipeline that collects IoT telemetry from bus fleets and enables predictive optimization of vehicle distribution across routes.

**Action:**
- Architected IoT telemetry collection from bus GPS units, occupancy sensors, and transit timing systems
- Designed cloud data processing pipeline using GCP Dataflow and Pub/Sub for low-latency event streaming
- Implemented predictive algorithms to forecast passenger demand and optimize vehicle redistribution
- Built time-series forecasting to anticipate peak demand periods and route congestion
- Created feedback loops connecting real-time data to operational decision systems

**Result:**
- Deployed real-time telemetry system handling 100+ bus fleet data points per minute
- Reduced average passenger wait times by 18% through predictive redistribution
- Achieved 92% on-time performance during peak hours through data-informed scheduling
- Validated feasibility of IoT-driven transit optimization for East African urban context

**Impact:** Case study demonstrating how emerging technologies can solve real urban mobility challenges in developing regions.
  $desc2$,
  ARRAY['IoT','GCP Dataflow','Pub/Sub','Data Engineering','Python','Time-series Forecasting','Cloud Architecture'],
  ARRAY['Real-time telemetry','Predictive modeling','Fleet optimization','Cloud streaming','Passenger analytics','Operational integration'],
  'Cloud',
  'https://github.com/AimeSerge',
  156, 32,
  ARRAY['/uploads/urban-mobility-thumbnail.svg'],
  TRUE, FALSE,
  '{"month":"May","year":"2022"}'::jsonb,
  '{"month":"August","year":"2023"}'::jsonb,
  ARRAY['Aime Serge UKOBIZABA'],
  'Technical Research'
),
(
  'professional-portfolio-ai-platform',
  'Professional Portfolio & AI-Powered Content Platform',
  'Production-ready full-stack system combining portfolio, research, and AI-powered discovery.',
  'Full-Stack Engineer & Architect',
  'A modern, security-hardened portfolio platform demonstrating full-stack architecture, AI integration, and production engineering practices.',
  $desc3$
**Situation:** Traditional portfolio sites are static and don't demonstrate engineering depth. A portfolio should itself be evidence of engineering capability—showing system design, security practices, scalability, and thoughtful UX.

**Task:** Build a production-ready full-stack application that serves as both a professional portfolio and a working software system demonstrating modern engineering practices.

**Action:**
- Architected layered Next.js 15 application with clear separation of domain, application, infrastructure, and presentation layers
- Implemented server-side rendering and static generation for SEO and performance optimization
- Built relational PostgreSQL schema with Row-Level Security for data isolation and multi-tenant patterns
- Integrated Gemini API with semantic search using pgvector (3072-dim embeddings) for AI-powered discovery
- Implemented comprehensive security: JWT authentication, Zod validation, PII filtering, rate limiting, CSP headers, audit logging
- Designed real-time knowledge base synchronization using database webhooks
- Created protected admin dashboard with analytics, security logs, and content management
- Deployed to Vercel with Edge middleware for low-latency security checks

**Result:**
- Delivered production-ready system handling 1000+ monthly visitors
- Achieved Lighthouse scores: 98+ Performance, 100 Best Practices, 100 Accessibility
- Reduced first-load JS by 45% through Server Components and code splitting
- Implemented zero-trust security architecture passing comprehensive penetration testing
- Created 15 static pre-rendered pages + 11 dynamic routes with optimized caching
- Built AI chat interface with semantic RAG providing context-aware responses

**Impact:** Portfolio itself demonstrates architectural thinking, security mindset, full-stack capability, and production-engineering standards.
  $desc3$,
  ARRAY['Next.js 15','React 19','TypeScript','PostgreSQL','pgvector','Gemini API','Supabase','Vercel','Tailwind CSS','Framer Motion'],
  ARRAY['AI semantic search','RAG-powered chat','Row-level security','Admin dashboard','Real-time sync','Security audit logging','Speech-to-text/TTS','Newsletter signup','Contact workflow'],
  'Full-Stack',
  'https://github.com/AimeSerge/aimeserge',
  1248, 187,
  ARRAY['/uploads/portfolio-platform-thumbnail.svg'],
  TRUE, TRUE,
  '{"month":"June","year":"2024"}'::jsonb,
  '{"month":"August","year":"2026"}'::jsonb,
  ARRAY['Aime Serge UKOBIZABA'],
  'Independent Project'
)
ON CONFLICT (slug) DO NOTHING;

-- 2. Resume: Organizations
INSERT INTO organizations (name)
VALUES ('ALX Africa'), ('EF NEXUS'), ('Ecole Secondaire Bumbogo');

-- 3. Resume: Experience (from Resume PDF "EXPERIENCE" section)
INSERT INTO experiences (
  company_id, title, employment_type, location, location_type,
  start_date, end_date, description
) VALUES
(
  (SELECT id FROM organizations WHERE name = 'ALX Africa'),
  'Front End Engineer and Backend Developer',
  'FULL_TIME', 'Kigali, Rwanda', 'ON_SITE',
  '2025-01-01', NULL,
  $exp1$Collaborated with cross-functional teams to deliver 15 projects within deadlines. Developed and maintained responsive web applications increasing user engagement by 98%. Optimized backend APIs improving data retrieval speed by 15%.$exp1$
),
(
  (SELECT id FROM organizations WHERE name = 'EF NEXUS'),
  'Front End Software Engineer',
  'FULL_TIME', 'Norrsken, Kigali, Rwanda', 'ON_SITE',
  '2025-07-01', NULL,
  $exp2$Developed responsive UI components enhancing user experience by 95% at EF NEXUS. Collaborated with UX designers to implement features that increased retention by 75%. Led integration of new design frameworks reducing development time by 65%.$exp2$
);

-- 4. Resume: Education (from Resume PDF "EDUCATION" section)
INSERT INTO educations (
  institution_id, degree, field_of_study, start_date, end_date
) VALUES (
  (SELECT id FROM organizations WHERE name = 'Ecole Secondaire Bumbogo'),
  'High School Diploma',
  'Mathematics, Physics, Computer Science',
  '2021-01-01', '2024-12-31'
);
