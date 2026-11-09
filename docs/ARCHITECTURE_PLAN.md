# Simple, Cheap, Dynamic: Target Architecture

**Goal:** you edit content in `/admin` and it is live on the site within seconds, with no redeploy. Every visitor still gets fast static HTML from the CDN. Hosting stays on free tiers.

---

## 1. How the site works today (analysis)

```
Visitor ──► Vercel CDN ──► Next.js page ──► Supabase (service-role key, every query)
                                   │
Admin ──► /admin (client) ─────────┼──► server actions ──► Supabase
                                   └──► (inbox) Supabase directly from the browser ⚠
```

| # | Finding | Effect |
|---|---|---|
| A1 | **Admin edits didn't reliably show up.** Saves refreshed one path; deletes refreshed `/admin`, not the public page; cached queries kept old data for up to 1 h; the homepage and project/paper detail pages were never refreshed. | "I changed it but the site still shows the old version." |
| A2 | **Project and paper detail pages queried the DB on every visit** (no cache). | Slower pages; burns Supabase free-tier quota. |
| A3 | **Blog pipeline is broken.** The admin "Blog" editor writes to `broadcasts`, but the public blog reads `posts` + `articles` (the auto-post trigger fires on `articles`). | Posts written in the admin never appear on `/blog`. |
| A4 | **Three sources of truth** for content: `constants.ts` fallbacks, SQL seed migrations, and the live DB. If the DB failed, the old hard-coded projects appeared silently, and were cached. | Hidden outages; editing one copy doesn't change the others. |
| A5 | **🔴 No Row-Level Security** on `contacts`, `knowledge`, `projects`, `research`, `certificates`, `broadcasts`. The admin inbox read `contacts` from the browser with the public anon key, which only works if the table is open. | Anyone with the anon key (it ships in the JS bundle) could read every contact message, edit projects, or rewrite the AI's knowledge through Supabase's REST API. |
| A6 | **Heavy features for a portfolio:** syndication to 6 platforms (≈1,000 lines), semantic search that calls Gemini on every search, server-side voice transcription, Discord + email alerts, an audit-log DB write on every form submit and download, a 4-layer "clean architecture" with barrel files. | More cost, more attack surface (the barrels are how the unauthenticated server actions leaked), harder to change. |

---

## 2. Target structure

```
                 ┌──────────── Vercel (Hobby, free) ─────────────┐
Visitor ───────► │ CDN: static HTML for every public page (ISR)  │
                 │   ▲ purged on save via revalidateTag/Path     │
Admin ─────────► │ /admin ─► server actions (admin JWT check) ───┼──► Supabase (free)
                 │ /api/chat (rate-limited) ─► Gemini Flash      │      Postgres + RLS
                 └───────────────────────────────────────────────┘      Storage (PDFs, images)
```

**Rules**
1. **Public pages are static + ISR.** No database call per visit. A 24 h timer is the safety net only.
2. **Writes go through one admin action** (`upsertContent` / `deleteContent`) that checks the session, validates, saves, then calls `revalidateContent(table)` to purge exactly the affected pages.
3. **The database is the single source of truth.** Fallback constants are an emergency backup only, never cached.
4. **The browser never talks to the database.** RLS: public `SELECT` on published content; nothing else for `anon`. The service-role key is server-only.
5. **Pay for AI only where it adds value** (the chat). Everything else uses free building blocks.

### Data model (target, 10 tables)

| Table | Purpose | Change |
|---|---|---|
| `profile` (1 row) | Headline, bio, "open to work", CV URL | **New**: makes the homepage hero editable |
| `organizations`, `experiences`, `educations`, `certificates`, `achievements` | Resume | Keep |
| `projects` | Case studies | Keep; add `featured`, `sort_order` |
| `research` | Papers | Keep |
| `posts` | Blog, one table: `kind` = article/note, `status`, `published_at`, `body` JSON | **Merge** `broadcasts` + `articles` + `posts` |
| `contacts` | Inbox (private) | RLS locked ✅ |
| `knowledge` | AI chat embeddings (private) | RLS locked ✅ |

### Code layout (target)

```
src/
  app/                 routes only (pages, api, sitemap, feed.xml)
  config/site.ts       identity, links, domain           ✅ done
  content/             one file per type: projects.ts, posts.ts, resume.ts, research.ts
                       (query + cache tag + zod schema together)
  admin/               actions.ts (save/delete), guard.ts
  lib/                 supabase.ts, security/, ai/
  components/
```
This replaces `core/application`, `core/domain/*/{actions,index,mutations,queries,types}.ts` and `infrastructure/`: about 40 files become about 15. The barrel re-exports go away, and with them the risk of accidentally exposing server actions.

---

## 3. Cost: keep it at $0/month

| Service | Use | Plan | Note |
|---|---|---|---|
| Vercel | Hosting, CDN, ISR, cron | Hobby (free) | Hobby is for personal, non-commercial sites. Upgrade to Pro only if the site sells services directly |
| Supabase | Postgres, storage | Free | Free projects pause after a week with no activity; the existing daily heartbeat cron prevents that |
| Gemini | Chat + embeddings | Free tier | Rate-limited; capped per request (done) |
| Resend | Inquiry email alert | Free | Drop the Discord webhook (one alert channel is enough) |
| Domain | Optional | ~$10–15/yr | Otherwise keep `*.vercel.app` |

Check each provider's current limits before relying on them; free tiers change.

**Cut to save money and code**

| Remove | Replace with | Saves |
|---|---|---|
| Syndication service + dashboard + 2 API routes + platform tokens | `/feed.xml` RSS feed. Dev.to and Hashnode import RSS automatically; Medium has an import tool; post to LinkedIn by hand | ≈1,000 lines, stored API tokens |
| Semantic search (Gemini call on every search) | Postgres full-text search (`to_tsvector`) or a static JSON index filtered in the browser | Every search becomes free and instant |
| Server voice transcription (`/api/v1/ai/voice/stt`) | Browser Web Speech API (already used for read-aloud) | Gemini audio cost |
| Audit-log insert on every form submit/download | Log only logins and admin writes; Vercel logs cover the rest | One DB write per action |

---

## 4. Plan

### Phase 1: make it dynamic and safe ✅ done in this change
- **RLS lockdown migration** `supabase/migrations/20261109120000_rls_lockdown.sql` (⚠ **apply it**: `supabase db push`, or paste it in the SQL editor).
- Inbox reads through an admin-only server action and refreshes every 60 s; the browser Supabase client is deleted (admin bundle 291 → 228 kB).
- `revalidateContent(table)` purges the right pages and queries on every save and delete (`src/infrastructure/cache/content.ts`).
- All public pages are static, and detail pages are pre-rendered (`generateStaticParams`); new slugs render on first visit.
- DB errors are never cached: fallbacks apply per request, and ISR keeps the last good page.
- The homepage "Where I've worked" list reads the `experiences` table.

### Phase 2: fix the blog and make the homepage editable ✅ done (code). ⚠ Apply the migration.
Migration: `supabase/migrations/20261109130000_phase2_dynamic_content.sql`
1. The admin **Blog** tab writes to `articles` (the table the public blog reads), using the new `ArticleEditor`: Markdown, **Save draft / Publish / Unpublish**. Publishing creates the feed post (DB trigger), indexes the article for AI search, and refreshes `/blog`, the article page and `/feed.xml`. Unpublishing removes the feed post and the search entry.
2. Fixed the read-time trigger (`SUM(boolean)`), which made article saves with text fail.
3. Old `broadcasts` posts are copied into `articles` as **drafts** for review; the `broadcasts` table is kept as legacy.
4. New **Profile** tab → `profile` table → homepage headline, intro, "open to work" badge, CV link.
5. Projects have **Feature on homepage** + **Order** → "Featured work" section (falls back to the newest three).
6. `/feed.xml` RSS feed, linked in the page `<head>`.

### Phase 3: simplify and cut cost (≈2–3 days)
1. Delete syndication and switch to RSS. Switch search to Postgres FTS, and voice input to the browser API.
2. Flatten folders to the layout above.
3. Remove the `constants.ts` content copies and old seed duplication; keep one seed file for local dev.
4. Use the anon key + RLS for public reads; keep the service role for admin writes only.

### Phase 4: optional hardening
- Upstash Redis for global rate limits (free tier).
- Nonce-based CSP to drop `'unsafe-inline'`.
- Playwright smoke test in GitHub Actions (free for public repos).
