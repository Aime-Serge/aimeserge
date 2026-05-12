# Aime Serge Portfolio Platform 🚀

[![Next.js 15](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-AI-blue?style=for-the-badge&logo=googlegemini)](https://deepmind.google/technologies/gemini/)

> **A mission-critical professional ecosystem for software engineering, cybersecurity research, and AI-driven brand orchestration.**

This platform is more than a portfolio; it is a **highly-engineered professional operating system**. It leverages **Clean Architecture** and **Domain-Driven Design (DDD)** to provide a secure, scalable, and intelligent hub for content distribution, career management, and automated knowledge discovery.

---

## 🏛️ Architectural Philosophy

The system is built on **Hexagonal Architecture** (Ports & Adapters) principles, ensuring that business logic is completely decoupled from infrastructure concerns.

- **`src/core/domain`**: Pure business logic, entities, and repository interfaces. No external dependencies.
- **`src/core/application`**: Use cases and orchestration logic (e.g., AI grounding, webhook processing).
- **`src/infrastructure`**: Concrete implementations of database clients, email services, security filters, and logging.
- **`src/presentation`**: Modern UI layer using Next.js App Router, React Server Components (RSC), and Framer Motion for high-fidelity interactions.

---

## 💎 Core Capabilities

### 🧠 AI Intelligence & RAG Pipeline
- **Retrieval-Augmented Generation (RAG):** Context-aware AI assistant utilizing `pgvector` for semantic search.
- **High-Dimension Embeddings:** Optimized **3072D vector space** (Gemini gemini-embedding-001) for superior retrieval accuracy.
- **Automated Grounding:** Real-time synchronization of project updates and research papers into the AI knowledge base via database webhooks.
- **Multimodal Speech:** Multimodal STT via Gemini 2.5 Flash and high-fidelity TTS via native Web Speech API.

### 📝 LinkedIn-Style Content Engine
- **Broadcast System:** Support for short-form posts and long-form articles with estimated read times.
- **Content Blocks:** Modular article builder supporting headings, code blocks, callouts, and multi-media layouts.
- **Engagement Metrics:** Native tracking of views, shares, and likes for performance analysis.
- **Visibility Controls:** Granular permissions for content access and comments.

### 🛡️ Cybersecurity & Resilience
- **PII Filtering:** Automated redaction of sensitive information before AI processing or logging.
- **Security Audit Layer:** Real-time logging of critical system events with automated Discord alerts.
- **Edge Middleware:** Zero-trust architecture with JWT-based admin verification and CSP injection.
- **Rate Limiting:** Distributed rate limiting for public-facing API routes and form submissions.

### 📁 Career & Research Management
- **Professional Schema:** Deep relational mapping between Organizations, Experiences, Projects, and Certificates.
- **Research Hub:** Distribution system for technical whitepapers with PDF management and abstract indexing.
- **Terminal Interface:** Interactive, hacker-themed CLI for navigating professional artifacts.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 15 (App Router), React 19, Tailwind CSS 4, Framer Motion |
| **Backend** | Supabase (PostgreSQL), Next.js Route Handlers, Server Actions |
| **AI/ML** | Google Gemini (Embeddings, Chat & STT), Web Speech API (TTS), Vercel AI SDK |
| **Security** | Jose (JWT), Zod (Validation), Custom PII Redaction Logic |
| **Operations** | Resend (Email), Discord Webhooks (Alerts), Supabase Storage |
| **State** | Redux Toolkit (Data Sync), Zustand (UI State) |

---

## 🚀 System Design Highlights

### 🔄 Webhook-Driven Knowledge Orchestration
When a new project or research paper is published, a Supabase webhook triggers the `HandleDbWebhookUseCase`. This use case:
1.  Extracts and sanitizes the content.
2.  Generates high-dimensional embeddings.
3.  Upserts the record into the `knowledge` vector table.
4.  Notifies the admin via the Secure Notification Layer.

### ⚡ Professional Relational Schema
The database follows a normalized professional schema, allowing for complex queries like "Show me all projects I worked on while at Organization X that used Tool Y".

---

## 🚦 Getting Started

### Prerequisites
- Node.js 20+
- Supabase Project with `pgvector` enabled
- Google Gemini API Key

### Installation
```bash
# Clone the repository
git clone https://github.com/Aime-Serge/aimeserge.git

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
```

### Environment Configuration
Ensure your `.env.local` contains these critical keys:
```env
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=          # Primary AI engine
JWT_SECRET=              # Admin session signing
DISCORD_WEBHOOK_URL=     # Critical security alerts
```

### Database Migration
The schema is managed through Supabase migrations. Apply the latest state using:
```bash
supabase db push
```

---

## 👨‍💻 Author

**Aime Serge UKOBIZABA**
*Senior Software Engineer & Cybersecurity Specialist*

- 🌍 [Live Platform](https://aimesergeonline.vercel.app/)
- 🤝 [LinkedIn](https://linkedin.com/in/aimeserge)
- 🧪 [Research](https://aimesergeonline.vercel.app/research)

---

## 📜 License

© 2026 Aime Serge UKOBIZABA. All rights reserved. This repository is private and proprietary.
