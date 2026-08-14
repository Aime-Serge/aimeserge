# Aime Serge UKOBIZABA — Professional Portfolio & Engineering Demonstration

**Live Portfolio:** [aimesergeonline.vercel.app](https://aimesergeonline.vercel.app) · **GitHub:** [@AimeSerge](https://github.com/AimeSerge) · **LinkedIn:** [aimeserge](https://linkedin.com/in/aimeserge)

---

## Executive Summary

This repository is a **production-ready full-stack application** that serves as both a professional portfolio platform and a **practical demonstration of modern engineering practices**. The site showcases technical depth through its architecture, security posture, and thoughtful feature implementation—making it valuable evidence for recruiters evaluating senior engineering capability, and for academic programs assessing technical preparation and communication skills.

The portfolio presents Aime Serge UKOBIZABA's work in **secure cloud architecture**, **AI system integration**, and **full-stack development**, with explicit focus on reliability, security, and scalability.

---

## What This Project Demonstrates

Beyond presenting portfolio content, this codebase demonstrates:

### Engineering Fundamentals
- **Modern full-stack development:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4
- **Relational database design:** PostgreSQL with Supabase, normalized schema for portfolio, research, and professional data
- **Layered architecture:** Clear separation of concerns (presentation → application → domain → infrastructure)
- **RESTful API design:** Validated endpoints with proper HTTP semantics and error handling
- **Security-by-design:** Multiple defensive layers protecting user data and system integrity

### Advanced Capabilities
- **AI Integration:** Gemini-powered contextual chat with RAG (retrieval-augmented generation) using semantic search over 3072-dimension embeddings
- **Real-time synchronization:** Database webhooks trigger updates to vector knowledge base when portfolio content changes
- **Authentication & authorization:** JWT-based admin access with role-based controls and Supabase Row-Level Security policies
- **Observable systems:** Security event logging, audit trails, and optional alerting (Discord/email)
- **Performance optimization:** Next.js static generation, server components for SEO, edge runtime for middleware

### Professional Practices
- **Input validation:** Zod schemas enforce data integrity at system boundaries
- **Privacy & compliance:** PII filtering before AI processing and logging
- **Rate limiting & protection:** Request throttling on public endpoints to prevent abuse
- **Accessibility:** Semantic HTML, keyboard navigation, screen-reader support, proper ARIA labels
- **SEO & discovery:** Structured data (JSON-LD), Open Graph, sitemaps, robots configuration
- **Documentation:** Clear code structure, commented complex logic, schema versioning

---

## For Recruiters

**What this codebase shows:**

| Technical Dimension | Evidence |
|---|---|
| **Backend capability** | Node.js/TypeScript API routes with validation, error handling, database access patterns |
| **Database design** | Normalized relational schema (organizations, experiences, education, projects, research, articles) with thoughtful relationships |
| **Security mindset** | Input sanitization, JWT auth, RLS policies, CSRF protection, rate limiting, PII filtering, audit logging |
| **Frontend craftsmanship** | Component composition, responsive design, client/server boundary management, performance optimization |
| **System design** | Layered architecture with clear domain boundaries, dependency injection for testability |
| **AI/ML integration** | Vector embeddings, semantic search implementation, RAG patterns, LLM prompt engineering |
| **DevOps readiness** | Environment configuration, database migrations, deployment to Vercel, infrastructure-as-code patterns |
| **Code quality** | TypeScript strict mode, consistent patterns, readable structure, accessibility compliance |

**What to evaluate:**

1. **Read the architecture** (below) to understand design decisions
2. **Explore the domain layer** (`src/core/domain/`) to see business logic isolation
3. **Review security** (`src/infrastructure/security/`) to see defense-in-depth approach
4. **Check types** (`src/core/domain/*/types.ts`) to see data model clarity
5. **Visit live portfolio** to see user experience and final product

---

## For Admissions Reviewers

**What this demonstrates:**

- **Technical communication:** Can explain complex systems clearly (this README, project documentation, public-facing descriptions)
- **Learning trajectory:** Full-stack development, cloud infrastructure, security, AI integration—breadth and depth
- **Project execution:** From conception (schema design) through deployment (production readiness)
- **Problem-solving:** Security challenges, performance optimization, user experience design
- **Standards awareness:** SEO, accessibility, privacy, code organization best practices
- **Initiative:** Built a substantial system not as coursework but as professional platform
- **Practical AI:** Moved beyond "hello world" to production RAG implementation

---

## Key Technical Features

### 🌐 Public Experience

- **Portfolio interface** – Projects, research papers, technical articles, resume, contact workflow
- **Responsive design** – Mobile-first, tested across devices
- **SEO foundation** – Structured data, Open Graph, dynamically generated sitemaps
- **Semantic discoverability** – AI-powered search and contextual chat grounded in portfolio content
- **Contact workflow** – Multi-step form with validation, honeypot spam protection, newsletter integration
- **Accessibility** – WCAG compliance, keyboard navigation, screen-reader friendly

### 🔐 Security & Admin

- **Protected dashboard** – JWT authentication, role-based access control
- **Content management** – Create/edit projects, research, articles, credentials, experiences
- **Security audit trail** – Log security events with optional notifications
- **Database protection** – Row-Level Security policies, encrypted secrets, audit logging
- **Input hardening** – Zod validation, HTML sanitization, XSS prevention
- **Rate limiting** – Protect public endpoints from abuse

### 🤖 AI & Search

- **Semantic search** – Query portfolio content by meaning, not keywords
- **Contextual chat** – Conversational assistant with retrieval-augmented generation
- **Vector embeddings** – Gemini API integration for semantic understanding
- **Knowledge sync** – Database webhooks auto-update searchable content
- **Privacy-aware** – PII filtering before AI processing

### 📊 Professional Data

- **Normalized schema** – Organizations, experiences, education, certificates, projects, research
- **Flexible content** – Articles, posts, broadcasts with publication workflows
- **Relational integrity** – Foreign keys, cascading deletes, data consistency
- **Time-series awareness** – Date handling, timeline calculations, chronological ordering

---

## Architecture

A pragmatic layered structure separates concerns and enables independent testing and extension:

```
src/
├── app/                              # Next.js routes, layouts, API handlers, metadata
│   ├── page.tsx                      # Home (hero + positioning + engineering approach)
│   ├── (portfolio)/
│   │   ├── projects/                 # Filterable project feed
│   │   ├── research/                 # Technical research papers + sidebar
│   │   ├── blog/                     # LinkedIn-style professional feed
│   │   ├── resume/                   # Professional timeline + credentials
│   │   ├── contact/                  # Multi-step contact form
│   │   └── terminal/                 # CLI-style navigation interface
│   ├── (dashboard)/
│   │   └── admin/                    # Protected content management workspace
│   ├── api/v1/
│   │   ├── ai/chat                   # Streaming chat endpoint with RAG
│   │   ├── ai/voice/*                # STT/TTS endpoints
│   │   ├── search                    # Semantic search endpoint
│   │   └── webhooks/database         # Supabase webhook listener for sync
│   ├── middleware.ts                 # JWT validation, security headers, CSP nonce injection
│   ├── robots.ts                     # SEO metadata
│   └── sitemap.ts                    # Dynamic sitemap generation
│
├── core/
│   ├── domain/                       # Business logic, isolated from delivery/infrastructure
│   │   ├── portfolio/                # Project, article, post, broadcast rules
│   │   ├── research/                 # Research paper management
│   │   ├── admin/                    # Admin operations (CRUD, bulk actions)
│   │   └── ai/                       # RAG prompting, embeddings logic
│   └── application/
│       ├── dtos/                     # Data transfer objects (webhook payloads, etc.)
│       └── use-cases/                # Orchestration (HandleDbWebhookUseCase, etc.)
│
├── infrastructure/
│   ├── database/
│   │   ├── server.ts                 # Server-side Supabase client (service_role)
│   │   └── client.ts                 # Browser-side Supabase client (anon key)
│   ├── security/
│   │   ├── headers.ts                # CSP, security headers utility
│   │   ├── piiFilter.ts              # Redact sensitive data before logging
│   │   ├── sanitizer.ts              # XSS prevention (sanitize-html wrapper)
│   │   ├── rateLimit.ts              # Request throttling middleware
│   │   └── shield.ts                 # Additional CSRF/validation helpers
│   ├── email/
│   │   └── mailer.ts                 # Resend API integration for notifications
│   ├── ai/
│   │   └── embeddings.ts             # Gemini embedding logic
│   └── utils/
│       ├── env.ts                    # Environment validation (Zod)
│       ├── storage.ts                # Cloud storage (Supabase Storage) helpers
│       ├── dateUtils.ts              # Date parsing, formatting
│       └── notifications.ts          # Discord/email alerts
│
└── presentation/                     # UI layer (Server & Client components)
    ├── components/
    │   ├── layout/                   # Header, Footer, Layouts
    │   ├── features/                 # Feature-specific components (ProjectFeed, Chat, etc.)
    │   ├── shared/                   # Reusable UI (ArticleRenderer, Badge, etc.)
    │   └── ui/                       # Primitive components
    └── styles/
        └── globals.css               # Tailwind imports, global animations

supabase/
├── config.toml                       # Supabase project configuration
└── migrations/
    ├── 20240421_security_and_newsletter.sql
    ├── 20260430_webhooks.sql         # Webhook table for sync
    ├── 20260505_research_upgrade.sql
    ├── 20260505_vector_dimension_fix.sql
    ├── 20260506_*.sql                # Schema refinements (articles, posts, projects metadata, etc.)
    └── 20260506_vector_3072_upgrade.sql  # Final vector size for embeddings

public/uploads/                      # Résumé, case-study PDFs, assets
scripts/                             # Database seeding, sync utilities, testing
```

### Design Principles

1. **Domain-Driven Design:** Business logic lives in `core/domain/`, independent of frameworks
2. **Separation of Concerns:** Infrastructure (DB, email, auth) separate from application and presentation
3. **Type Safety:** TypeScript strict mode, Zod validation at boundaries
4. **Security-First:** Validation, sanitization, authentication, rate limiting built in from start
5. **Testability:** Dependencies injected, pure functions, minimal framework coupling
6. **Performance:** Static generation where possible, server components for SEO, caching strategies

---

## Key Dependencies

| Purpose | Package | Version |
|---------|---------|---------|
| **Framework** | Next.js | 15.5.23 |
| **UI Runtime** | React | 19.1.0 |
| **Language** | TypeScript | 5.9.3 |
| **Styling** | Tailwind CSS | 4.2.2 |
| **Database** | @supabase/supabase-js | 2.102.1 |
| **Validation** | Zod | 4.3.6 |
| **Auth** | jose (JWT) | 6.2.2 |
| **AI/Chat** | @ai-sdk/google, @google/generative-ai | 3.0.67, 0.24.1 |
| **Security** | sanitize-html, bcryptjs | 2.11.0, 3.0.2 |
| **Email** | resend | 6.12.2 |
| **Analytics** | @vercel/analytics, @vercel/speed-insights | 2.0.1, 2.0.0 |

---

## Getting Started (Development)

### Prerequisites
- Node.js 18+ (LTS recommended)
- Supabase account ([supabase.com](https://supabase.com))
- Google Cloud account for Gemini API ([ai.google.dev](https://ai.google.dev))
- Vercel account for deployment (optional)

### Local Setup

1. **Clone & install:**
   ```bash
   git clone https://github.com/AimeSerge/aimeserge.git
   cd aimeserge
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (from Supabase)
   - `SUPABASE_SERVICE_ROLE_KEY` (Supabase service role)
   - `GEMINI_API_KEY` (Google AI)
   - `JWT_SECRET` (generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)

3. **Sync database schema:**
   ```bash
   # Using Supabase CLI (recommended)
   supabase db push
   
   # Or run migrations manually in Supabase console
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```
   
   Visit [http://localhost:3000](http://localhost:3000)

5. **Access admin dashboard:**
   - Login at [http://localhost:3000/login](http://localhost:3000/login)
   - Manage projects, research, credentials at [http://localhost:3000/admin](http://localhost:3000/admin)

### Build for Production

```bash
npm run build
npm start
```

Or deploy to Vercel:
```bash
vercel deploy --prod
```

---

## How to Evaluate This Code

### For Hiring Managers / Recruiters

**Questions to answer:**

1. ✅ **Can this person architect systems?** 
   - Look at `src/core/domain/` structure, schema design, API route organization
   
2. ✅ **Do they understand security?**
   - Review `src/infrastructure/security/` (auth, validation, sanitization, rate limiting)
   - Check middleware.ts for CSP, security headers
   
3. ✅ **Can they work with modern stacks?**
   - Explore Next.js 15 App Router usage, TypeScript patterns, React Server Components
   
4. ✅ **Do they ship products?**
   - Visit live portfolio to see polished user experience and attention to detail
   
5. ✅ **Can they explain technical decisions?**
   - Read comments in complex files (ai integration, webhook handling, vector search)

**Start here:**
- `src/core/domain/portfolio/types.ts` — data model clarity
- `src/infrastructure/database/server.ts` — error handling, graceful degradation
- `src/app/api/v1/ai/chat/route.ts` — RAG implementation
- `src/middleware.ts` — security posture

### For Academic Programs

**Evidence of learning & capability:**

1. ✅ **Technical depth:** Multi-layer application (front-end, back-end, database, AI)
2. ✅ **Modern standards:** TypeScript, security practices, accessibility, SEO
3. ✅ **Communication:** Code is readable, clear naming, thoughtful organization
4. ✅ **Continuous learning:** Implements emerging patterns (Server Components, AI integration)
5. ✅ **Initiative:** Built as personal project, not coursework requirement

**Start here:**
- Browse the live portfolio to see finished product
- Check `src/` structure to understand architecture
- Review security implementations to see security awareness

---

## Highlights for Reviewers

### Security & Reliability
- ✅ **Input validation at all boundaries** – Zod schemas prevent invalid data
- ✅ **XSS prevention** – sanitize-html wrapper for user content
- ✅ **PII protection** – Redaction before logging, compliance-aware
- ✅ **Authentication** – JWT with httpOnly secure cookies, Edge Runtime verification
- ✅ **Rate limiting** – Protect against abuse on public endpoints
- ✅ **Database security** – Row-Level Security policies, encrypted secrets
- ✅ **Audit trail** – Security events logged for compliance/investigation

### Performance & SEO
- ✅ **Static generation** – 15 pages prerendered, fast TTFB
- ✅ **Server Components** – React 19 server components for SEO and performance
- ✅ **Semantic HTML** – Proper heading hierarchy, ARIA labels
- ✅ **Structured data** – JSON-LD Person schema for search engines
- ✅ **Dynamic sitemaps** – Generated at build time

### User Experience
- ✅ **Responsive design** – Mobile-first, works on all devices
- ✅ **Keyboard navigation** – Full keyboard support, skip links
- ✅ **Accessibility** – WCAG 2.1 AA compliance (semantic HTML, alt text, contrast)
- ✅ **Performance monitoring** – Vercel Analytics & Speed Insights integrated
- ✅ **Error handling** – User-friendly messages, graceful degradation

### AI Integration (Modern & Practical)
- ✅ **RAG (Retrieval-Augmented Generation)** – Chat grounded in portfolio content
- ✅ **Semantic search** – Natural language queries over embeddings
- ✅ **Vector database** – pgvector in PostgreSQL with 3072-dimension embeddings
- ✅ **Streaming responses** – Real-time chat with streaming from Gemini API
- ✅ **Production-ready** – Not a demo, actual working integration

---

## Evidence in the Codebase

| Skill | Where to Look | What You'll See |
|-------|---------------|----|
| **Database design** | `supabase/migrations/` | Normalized schema, relationships, indexes |
| **API security** | `src/app/api/v1/*/route.ts` | Input validation, error handling, auth checks |
| **TypeScript** | Any `*.ts` file | Strict types, no `any`, clear interfaces |
| **React patterns** | `src/presentation/components/` | Server/Client boundary, composition, hooks |
| **System design** | `src/core/domain/*/` | Domain logic separated from delivery |
| **Error handling** | `src/infrastructure/database/` | Graceful degradation, try/catch, logging |
| **Testing mindset** | Type definitions, validation logic | Pure functions, dependency injection ready |
| **Documentation** | Code comments, this README | Clear explanations of complex logic |

---

## Live Portfolio Evaluation

Visit **[aimesergeonline.vercel.app](https://aimesergeonline.vercel.app)** and notice:

✅ **Professional branding** — Cyber-themed aesthetic, consistent design language  
✅ **Multiple entry points** — Projects, research, blog, resume—cater to different audiences  
✅ **Project case studies** — STAR format (Situation-Task-Action-Result) with downloadable PDFs  
✅ **Semantic search** — Try the search: "AI cloud security" shows relevant results  
✅ **AI chat** — Ask questions about engineering approach, projects, or technical topics  
✅ **Contact workflow** — Multi-step form with validation and newsletter integration  
✅ **Mobile-responsive** — Try on phone—full functionality preserved  

---

## Production Deployment

Deployed to **Vercel** with:
- Automatic deployments on git push
- Edge middleware for security headers
- Analytics and performance monitoring
- Environment-specific configuration

Environment requirements for production:
- All `.env` variables set (no placeholders)
- Supabase production project credentials
- Verified email service (Resend)
- Google AI API key with quota

---

## Questions for Evaluation

**Technical depth:** "Can you explain why the domain layer is separate from the presentation layer?"

**Problem-solving:** "How does this system handle a situation where Supabase is unavailable during build time?"

**AI implementation:** "Walk me through how semantic search works in this portfolio."

**Security:** "What would happen if someone tried to inject malicious HTML in an article?"

**DevOps:** "How would you add a new feature to this system?" (Follow the layered architecture: domain → API → presentation)

---

## Contact & Professional Links

- **Portfolio:** [aimesergeonline.vercel.app](https://aimesergeonline.vercel.app)
- **GitHub:** [@AimeSerge](https://github.com/AimeSerge)
- **LinkedIn:** [aimeserge](https://linkedin.com/in/aimeserge)
- **Email:** Available via portfolio contact form

---

## Final Note

This project was built with intentionality. Every technical decision reflects thoughtful engineering: from the separation of concerns in the architecture, to the security-first approach in middleware, to the accessibility considerations in UI components. The portfolio is not just a showcase of past work—**it is itself evidence of engineering capability, communication skill, and attention to professional craftsmanship**.