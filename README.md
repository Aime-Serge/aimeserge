# Aime Serge UKOBIZABA — Professional Portfolio Platform

[Live portfolio](https://aimesergeonline.vercel.app/) · [Projects](https://aimesergeonline.vercel.app/projects) · [Research](https://aimesergeonline.vercel.app/research) · [LinkedIn](https://linkedin.com/in/aimeserge) · [GitHub](https://github.com/AimeSerge)

This repository contains the source for Aime Serge UKOBIZABA’s professional portfolio: a full-stack platform that presents engineering work, technical research, credentials, and professional writing in one accessible experience. It is designed to give recruiters and admissions reviewers direct evidence of technical depth, system design practice, security awareness, and scholarly communication.

## What this project demonstrates

The platform is both a portfolio and a working software system. It demonstrates the ability to:

- Design and deliver a modern full-stack application with Next.js, React, TypeScript, and PostgreSQL.
- Model professional, academic, and project information in a relational database with Supabase and Row Level Security.
- Build AI-assisted discovery using semantic search, Gemini embeddings, and retrieval-augmented chat.
- Apply practical security controls, including server-side validation, PII redaction, rate limiting, security headers, protected administration routes, and audit logging.
- Create clear public-facing experiences for projects, research papers, technical articles, a résumé, and professional enquiries.
- Maintain an editorial workflow through a protected content-management dashboard and database-triggered synchronization.

## For recruiters and admissions reviewers

The public site provides focused entry points for evaluating the candidate’s work:

| Area | Evidence available |
| --- | --- |
| Engineering portfolio | Project pages with technologies, responsibilities, features, media, and case-study documents. |
| Research and communication | Technical research papers, abstracts, citations, downloadable assets, articles, and short-form posts. |
| Professional preparation | Résumé, education, experience, certificates, and verified professional profile links. |
| Applied AI | A contextual assistant grounded in portfolio and research content, plus semantic search support. |
| Security mindset | Input handling and data protection utilities, authentication middleware, protected administration, and security-event records. |

The home page frames the work around secure cloud architecture, AI deployment, and scalable full-stack systems. The project collection includes case-study PDFs in `public/uploads/` so reviewers can inspect implementation work in more depth.

## Key capabilities

### Public experience

- Responsive portfolio, project, research, blog, résumé, contact, and terminal-style navigation pages.
- SEO metadata, Open Graph metadata, sitemap, robots configuration, and Person structured data.
- Research and article pages that render structured content and support associated documents.
- A multi-step contact workflow with validation, a honeypot field, newsletter preference, and notification support.

### Content and professional data

- Normalized records for organizations, experience, education, certificates, projects, and research.
- Separate article and post workflows, including publication state and calculated reading time.
- A protected administrative workspace for managing projects, research, credentials, broadcasts, résumé content, enquiries, security logs, and manual knowledge-base synchronization.

### AI and search

- Gemini-powered chat endpoint with streaming responses.
- Retrieval context assembled from a `pgvector` knowledge base using 3072-dimension embeddings.
- Database-webhook workflow for updating searchable knowledge when portfolio content changes.
- Speech-to-text and text-to-speech endpoints/interfaces for more accessible interaction.

### Security and reliability

- Zod schemas and server-side validation at system boundaries.
- PII filtering before AI processing and logging.
- Request throttling for public AI and interaction flows.
- JWT-protected administrative access and security-focused HTTP headers through middleware.
- Supabase Row Level Security policies, security event logging, and optional Discord/email alerts.

## Architecture

The codebase uses a pragmatic layered structure that keeps domain rules distinct from delivery and infrastructure concerns:

```text
src/
├── app/                       # Next.js routes, layouts, API handlers, metadata
├── core/
│   ├── domain/                # Portfolio, research, AI, admin, and interaction rules
│   └── application/           # Use cases and DTOs, including webhook processing
├── infrastructure/            # Database, email, security, utilities, integrations
└── presentation/              # Reusable UI, features, layouts, and global styles
supabase/migrations/           # Versioned schema, RLS, trigger, and vector changes
scripts/                       # Controlled seeding, synchronization, and setup tasks
public/uploads/                # Résumé and project case-study assets
```

This separation makes the application easier to extend: presentation components do not own core business rules, while domain workflows can rely on infrastructure adapters for services such as Supabase, Gemini, email, and notifications.

## Technology stack

| Concern | Implementation |
| --- | --- |
| Web application | Next.js 15, React 19, TypeScript, App Router |
| Styling and interaction | Tailwind CSS, Framer Motion, Lucide |
| Data | Supabase, PostgreSQL, `pgvector`, Supabase Storage |
| AI | Google Gemini, Vercel AI SDK, semantic retrieval |
| Application state | Redux Toolkit and Zustand |
| Security | Jose/JWT, Zod, custom sanitization and PII filtering, rate limiting |
| Operations | Resend, Discord webhooks, Vercel Analytics and Speed Insights |

## Run locally

### Prerequisites

- Node.js 20 or later
- npm
- A Supabase project; enable `pgvector` if using semantic search
- A Google Gemini API key for chat, embeddings, or speech features
- Supabase CLI for applying migrations (optional for UI-only development)

### Setup

```bash
git clone https://github.com/Aime-Serge/aimeserge.git
cd aimeserge
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000` after the development server starts.

To apply the versioned database schema to a linked Supabase project:

```bash
supabase db push
```

### Environment variables

`.env.example` documents every supported setting. The primary variables are:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
ADMIN_EMAIL=
GEMINI_API_KEY=
SUPABASE_WEBHOOK_SECRET=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
DISCORD_WEBHOOK_URL=
```

Keep `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, Gemini keys, and webhook URLs out of version control. The service-role key must remain server-side only. See [DATABASE_CREDENTIALS_SETUP.md](DATABASE_CREDENTIALS_SETUP.md) for fuller setup guidance.

## Quality checks

```bash
npm run lint
npm run build
```

Production deployments should provide the same required secrets through the hosting provider’s secure environment-variable settings. The project includes `vercel.json` for Vercel-oriented deployment configuration.

## Author

**Aime Serge UKOBIZABA**
Software Engineer · Cybersecurity Analyst · Aspiring AI Engineer

- Portfolio: [aimesergeonline.vercel.app](https://aimesergeonline.vercel.app/)
- Email: [aimeserge51260@gmail.com](mailto:aimeserge51260@gmail.com)
- LinkedIn: [linkedin.com/in/aimeserge](https://linkedin.com/in/aimeserge)
- GitHub: [github.com/AimeSerge](https://github.com/AimeSerge)

## License

© 2026 Aime Serge UKOBIZABA. All rights reserved. This is a private, proprietary portfolio project.
