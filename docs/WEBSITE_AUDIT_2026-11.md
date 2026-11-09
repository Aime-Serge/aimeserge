# Portfolio Website Audit & Optimisation (November 2026)

**Scope:** whole codebase (Next.js 15, Supabase, Gemini AI, Vercel): security, performance, content and credibility.
**Status:** fixes below are implemented on the working tree, type-checked, built (17/17 pages) and smoke-tested on a production server.

---

## 1. Summary for stakeholders

| Area | Before | After |
|---|---|---|
| **Security** | 6 back-end functions anyone on the internet could call, including ones that rewrite the AI's knowledge or post to LinkedIn/Medium using the owner's accounts | All locked to the signed-in admin; verified with live requests (401) |
| **Credibility** | Site said "Senior", "5+ years", "A+ audit", "1,248+ monthly visitors", 4 "verified" testimonials. None of it matches the CV or can be proven | Every claim now comes from the CV. Unprovable numbers and testimonials removed |
| **Clarity** | Sci-fi jargon ("Sync with Node_01", "Initiate Contact", "Transmit Payload") | Plain English any visitor understands (see `docs/CONTENT_GUIDE.md`) |
| **Speed** | 1.6 MB photo used as favicon and social image on every page; AI chat code loaded on every page | 1.7 KB favicon, 52 KB social image; chat loads only when clicked |
| **Page weight** | Contact 188 kB · Blog article 222 kB | Contact **110 kB (−41 %)** · Blog article **139 kB (−37 %)** |
| **Privacy** | Contact form silently stored marital status ("Single" by default) and gender | Removed. Only what's needed to reply is collected |

---

## 2. Security findings

| # | Severity | Finding | Fix |
|---|---|---|---|
| S1 | **Critical** | `upsertKnowledge` / `deleteKnowledge` server actions had no auth. Anyone could rewrite or wipe the AI assistant's knowledge base, so it would tell visitors false things about Aime (prompt-injection / defamation risk). | Admin session required (`ai/mutations.ts`) |
| S2 | **Critical** | `syndicateContentAction`, `resyndicateContentAction` and `publishArticleWithFullDistribution` had no auth. Anyone could publish arbitrary text to Medium/Dev.to/LinkedIn **using the owner's API tokens**. | Admin session required (`syndication-actions.ts`) |
| S3 | **High** | `/api/v1/admin/syndicate` and `/syndication/content` accepted **any** `Authorization: Bearer …` value. Middleware skips `/api`, so nothing else protected them. | Real cookie-session check via new `requireAdminApi()` guard. This also fixes the admin Syndication tab, which never sent a header and was always broken. |
| S4 | **High** | `syncBroadcastToKnowledge`, `syncProjectToKnowledge` and `recordSecurityEvent` were callable by the public (log flooding, knowledge poisoning). | Auth added; `recordSecurityEvent` no longer exported |
| S5 | **High** | `getSecurityStatus` was public and rendered on `/projects` and `/research/[slug]`, telling attackers how many warnings and critical events had been logged in the last 24 h. | Admin-only; widget removed from public pages |
| S6 | Medium | Admin `upsertContent` / `deleteContent` / `getAllContent` took any table name. A stolen session could edit `security_logs`, `knowledge`, etc. | Allow-list of 9 content tables |
| S7 | Medium | `/_next/image` allowed **any** remote host (`hostname: "**"`): a free image proxy billed to the owner. | Supabase + YouTube thumbnails only |
| S8 | Medium | AI cost abuse: chat accepted 100 × 10,000-char messages with `system`/`tool` roles; voice-to-text had no rate limit or size cap. | Chat: user/assistant only, ≤20 turns, ≤4,000 chars, 800-token answers, 15 req/min. STT: 10 req/min, 2 MB, audio only |
| S9 | Medium | Two conflicting CSPs and Permissions-Policies (one blocked the mic the voice feature needs, and `media-src` blocked audio). `/api` responses had no security headers. | One header set in `next.config.ts` for all routes, CSP in middleware; `X-Powered-By` removed; HSTS 2 years |
| S10 | Medium | Contact form: no length limits, raw DB errors shown to visitors, sensitive personal data (marital status, gender) collected with a default value. | Max lengths on every field, friendly errors, fields removed, server-side honeypot |
| S11 | Low | JSON-LD built with `JSON.stringify` (a `</script>` in DB content could break out). | `jsonLd()` escapes `<` |
| S12 | Low | Sanitiser allowed `data:` links and iframes from any host. | `http/https/mailto` links only; YouTube/Vimeo iframes only |
| S13 | Low | Login revealed whether an email was the admin ("Identity not recognised as Node Operator"). | Same message for every failure |
| S14 | Low | Rate-limit key used the whole `x-forwarded-for` chain and the map grew forever. | First IP, per-action keys, auto-prune |
| S15 | Low | `/admin` and `/login` could be cached and indexed. | `Cache-Control: private, no-store` + `noindex` |
| S16 | Info | `.bevel/do_not_share` (local tool files) was untracked but not ignored. | Added to `.gitignore` |

**No secrets were found in the repo or git history** (only placeholders in docs).

### Still open (needs owner or infrastructure)
1. **Rate limiting is per server instance.** On Vercel, each instance keeps its own counter. For a hard limit, back `rateLimit.check()` with Upstash Redis (free tier).
2. **The service-role key is used for every query**, so Supabase Row-Level Security never applies. Use the anon key for public reads, and keep the service role for admin writes.
3. `script-src 'unsafe-inline'` remains (Next.js needs it without nonces). Adopt nonce-based CSP later if desired.
4. Add a real **Privacy page** (the contact form collects personal data). The old footer links pointed to `#`.

---

## 3. Performance changes

- **Icons and social image:** `logo.png` (1.6 MB) was the favicon, apple icon, manifest icon and OG image. Replaced with `/public/icons/*` (favicon 1.7 KB, 192 px 12 KB, 512 px 55 KB, OG 1200×630 52 KB with name and title).
- **AI chat on demand:** a tiny button is rendered; the ~550-line chat bundle downloads on hover or click.
- **Blog articles:** `ArticleRenderer` now runs on the server, so `sanitize-html` (~65 kB) no longer ships to browsers.
- **Contact page:** server-rendered page + small form; no framer-motion; 188 kB → 110 kB.
- **Middleware** no longer runs on images, PDFs and other static files (fewer edge invocations).
- **Dependencies:** 14 unused packages removed (Redux, Zustand, popmotion, jsonwebtoken, bcryptjs, headlessui, react-icons, react-markdown, …): 162 fewer installed packages.
- `optimizePackageImports` for `lucide-react` and `framer-motion`; image cache 30 days; `/uploads` cached 1 week.
- **Accessibility:** pinch-zoom re-enabled (`maximumScale: 1` removed); contact labels linked to inputs; chat panel fits 320 px phones; the AI no longer speaks out loud unless the visitor turns sound on.

**Next wins:** `/research` (154 kB) and `/resume` (151 kB) still use framer-motion in `ResearchFeed` and `BadgeShowcase`. CSS transitions would save ~40 kB each.

---

## 4. Content plan (product + writing)

**Positioning, one line:** *"I build secure, reliable software, and add AI where it actually helps."*
**Title everywhere:** Software Engineer · Cybersecurity · AI (matches the CV).

| Page | Job of the page | Status |
|---|---|---|
| Home | Who, what I do (in outcomes), proof (employers + learning), one clear CTA | ✅ Rewritten |
| Projects | Case studies: problem → what I did → result | ✅ Intro rewritten, fake stats removed. ⏳ Case-study text lives in Supabase/constants and needs a pass with the template in the guide |
| Resume | Experience, education, certificates, CV download | ✅ Jargon headings removed, self-rated % removed, counts now live |
| Research | Plain summary first, then method | ✅ Intro + focus areas rewritten, fake "AES_256 / SIGNED_BY" panel removed |
| Blog | Articles in plain language | ✅ Intro rewritten, hard-coded "1.2k reached / 45 retransmissions" removed |
| Contact | Shortest path to a message | ✅ Rebuilt: one step, 6 fields |
| Footer / header | Name, links, email | ✅ All from `src/config/site.ts` |
| AI assistant | Friendly, grounded, short answers | ✅ New prompt: plain English, explains jargon, ignores injected instructions |

### Decisions needed from Aime
1. **GitHub handle:** the code used both `github.com/aime-serge` (footer) and `github.com/AimeSerge` (project links, JSON-LD). These are different accounts. Set the right one in `src/config/site.ts`.
2. **Domain:** ✅ resolved. The live site is `https://aimeserge.vercel.app` (matches the CV); `aimesergeonline.vercel.app` does not exist. Override with `NEXT_PUBLIC_SITE_URL` if you add a custom domain.
3. **Testimonials:** the four removed quotes (Dr. Emmanuel Ndayisaba, Sarah Musyoka, James Karanja, Amara Okonkwo) couldn't be matched to anything. If they're real, re-add them with permission and a source; the section reappears automatically.
4. **Project metrics to verify or remove** (in DB seeds/constants): "94 % model accuracy", "8,760+ hourly observations" (that's one year of hours, but the study covers 24 years), "22 % cost reduction" (testimonial) vs "18 %" (old homepage).
5. **CV:** it has the same issue as the old site ("engagement up 98 %", "UX up 95 %", "vulnerabilities down 60 %"). Recruiters read these as filler. Keep only figures you can explain in an interview.

---

## 5. Housekeeping recommendations
- Move the 10 old root-level reports (`*_AUDIT*.md`, `HOMEPAGE_IMPROVEMENTS.md`, `DIAGNOSTIC_FIX.sql`, …) into `docs/archive/`.
- Delete `scripts/test-gemini*.mjs` (v1–v5) and `public/Screenshot From *.png` if no longer used.
- Re-enable lint in builds (`eslint.ignoreDuringBuilds: false`) once the remaining `any` types are fixed.
- Remove `SecurityDeterrence.tsx` if unused: blurring the page on focus loss hurts real visitors more than it stops copying.
