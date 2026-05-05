# Aime Serge Portfolio Platform

A production-style portfolio, research, and professional branding platform built with `Next.js 15`, `React 19`, `TypeScript`, `Supabase`, and `OpenAI` integrations.

This project goes beyond a traditional portfolio site. It combines secure content publishing, AI-assisted discovery, technical research distribution, resume and certificate management, protected admin operations, and interactive user experiences into a single platform.

## Live Experience

- Live site: `https://aimesergeonline.vercel.app/`
- Repository: `https://github.com/Aime-Serge/aimeserge.git`

## Highlights

- AI-powered portfolio assistant using retrieval-augmented generation (RAG)
- Dynamic project, research, blog, resume, and credential experiences
- Cybersecurity-themed UI with responsive navigation and terminal interface
- Protected admin dashboard for managing portfolio artifacts
- Global content search across projects, research, and blog content
- Secure contact and newsletter workflows backed by Supabase
- Audit logging, rate limiting, middleware protection, and security headers
- Resume and media delivery through Supabase Storage

## Core Features

### Public Portfolio

- Landing page with strong engineering, cloud, AI, and security positioning
- Dynamic project feed and project detail pages
- Research publication and PDF download workflows
- Blog/broadcast content presentation
- Resume page with certificate showcase and downloadable assets
- Terminal-style interface for interactive portfolio exploration
- Contact flow for hiring, collaboration, consulting, and research inquiries

### AI Layer

- Domain-specific AI chat assistant exposed at `/api/v1/ai/chat`
- Context assembly through vector similarity search
- Embedding-powered knowledge retrieval with `text-embedding-3-small`
- Content sync support for research and blog artifacts into a `pgvector` knowledge base

### Security and Operations

- Edge middleware for protected routes and response hardening
- JWT verification for admin access control
- Content Security Policy injection and security headers
- Rate limiting for public APIs and form submissions
- Server action shielding with optional PII redaction
- Security audit logging stored in Supabase

### Admin Experience

- Admin dashboard for project, research, broadcast, credential, inquiry, and resume workflows
- Artifact editing and operational visibility
- Resume upload and public asset synchronization
- Inquiry vault and security log export support

## Tech Stack

### Frontend

- `Next.js 15`
- `React 19`
- `TypeScript`
- `Tailwind CSS 4`
- `Framer Motion`
- `Lucide React`

### Backend and Data

- `Supabase`
- `PostgreSQL`
- `Supabase Storage`
- `pgvector`
- `Next.js Route Handlers`
- `Server Actions`

### AI

- `OpenAI`
- `AI SDK`
- `Embeddings`
- `Retrieval-Augmented Generation (RAG)`

### State and Utilities

- `Redux Toolkit`
- `Zod`
- `react-hot-toast`

## Project Structure

```text
src/
├── app/                  # App Router pages, route groups, and API routes
├── components/           # UI, layout, and feature components
├── core/                 # AI orchestration and security runtime logic
├── lib/                  # Supabase, AI, and shared library code
├── modules/              # Portfolio, research, admin, and communication modules
├── store/                # Redux state, slices, and mock data
├── styles/               # Global styles
├── types/                # Shared TypeScript types
└── utils/                # Storage, notifications, environment, and PDF helpers
```

## Key Routes

### Public

- `/`
- `/projects`
- `/projects/[slug]`
- `/research`
- `/research/[slug]`
- `/blog`
- `/blog/[id]`
- `/resume`
- `/contact`
- `/terminal`

### Admin

- `/admin`

### API

- `/api/v1/ai/chat`
- `/api/v1/ai/voice/tts`
- `/api/v1/ai/voice/stt`
- `/api/v1/search`

## Environment Variables

Create a `.env.local` file with the following values:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
ADMIN_EMAIL=
GEMINI_API_KEY=          # Required for Gemini chat + embeddings
RESEND_API_KEY=          # Required for email notifications
RESEND_FROM_EMAIL=       # (Optional) e.g., System <onboarding@resend.dev>
DISCORD_WEBHOOK_URL=     # Required for real-time mobile push
SUPABASE_WEBHOOK_SECRET= # Secret shared with Supabase to secure webhooks
NODE_ENV=development
```

### Variable Notes

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public client key for browser access
- `SUPABASE_SERVICE_ROLE_KEY`: Required for privileged server operations
- `JWT_SECRET`: Secret used for admin session verification
- `ADMIN_EMAIL`: Email used for admin checks and internal logging
- `GEMINI_API_KEY`: API key for Gemini chat and vector embeddings
- `RESEND_API_KEY`: API key from resend.com
- `DISCORD_WEBHOOK_URL`: Discord channel webhook URL for instant push alerts
- `SUPABASE_WEBHOOK_SECRET`: A secure random string set in Supabase Webhook settings

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Add the required values to `.env.local`.

### 3. Set up Supabase

Use the SQL definitions in:

- `SEED_SQL.md`
- `supabase/migrations/20240421_security_and_newsletter.sql`

Make sure your project includes:

- `projects`
- `broadcasts`
- `research`
- `certificates`
- `contacts`
- `knowledge`
- `security_logs`

Also ensure:

- `pgvector` extension is enabled
- storage buckets such as `artifacts` and `resumes` exist if you use uploads
- Row Level Security and policies are configured appropriately for production

### 4. Run the app

```bash
npm run dev
```

Open `http://localhost:3000`.

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

Additional helper scripts:

```bash
node scripts/setup-admin.mjs
node scripts/seed-research.mjs
node scripts/sync-kb.mjs
```

## Search and AI Architecture

The platform supports two layers of intelligent discovery:

### Global Search

- Aggregates projects, research, and broadcasts
- Builds searchable documents with cached indexing
- Scores documents by title, snippet, tags, and full searchable text

### RAG Assistant

- Embeds content into a Supabase `knowledge` table
- Retrieves semantically relevant chunks via `match_knowledge`
- Injects retrieved context into the AI system prompt
- Streams responses through the AI route handler

## Security Design

Security is a first-class concern in this project.

- Middleware injects CSP and additional security headers
- Admin routes require a verified JWT cookie
- Public interactions are rate limited
- Sensitive workflows use a server action shield wrapper
- Audit logs are written to `security_logs`
- Optional PII redaction is available before processing inputs

## Storage and Media

The project supports:

- public resume delivery
- certificate PDF links
- research paper PDFs
- case study documents
- image and media asset resolution through Supabase Storage helpers

## Deployment

This project is designed to work well with `Vercel` and `Supabase`.

Recommended production setup:

- Deploy the Next.js app to Vercel
- Host database and storage in Supabase
- Configure environment variables in Vercel
- Apply SQL schema and migrations in Supabase
- Use secure secrets for `JWT_SECRET` and service-role access

## Ideal Use Cases

- Technical personal brand platform
- Engineering portfolio with dynamic content management
- Research publishing hub
- AI-enhanced professional profile
- Secure showcase for projects, certifications, and downloadable artifacts

## Roadmap Ideas

- richer admin analytics
- automated content ingestion for new artifacts
- improved semantic ranking for search
- multi-user admin roles
- voice-native AI assistant workflows
- stronger observability and monitoring

## Author

**Aime Serge UKOBIZABA**

- Software Engineer
- Cybersecurity Analyst
- Aspiring AI Engineer
- Google Cloud Certified

## License

This repository is currently private and no license has been specified.
