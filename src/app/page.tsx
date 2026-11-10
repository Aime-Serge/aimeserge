import Link from "next/link";
import { ArrowRight, Code2, ShieldCheck, Sparkles, FileDown } from "lucide-react";
import { SITE, jsonLd } from "@/config/site";
import { getExperiences, getProfile, getFeaturedProjects } from "@/core/domain/portfolio/queries";

// Static HTML, refreshed when the profile, projects or experiences change in the admin (or daily).
export const revalidate = 86400;

/*
 * Homepage copy rules (see docs/CONTENT_GUIDE.md):
 *  - Every claim must be checkable on the CV or a linked project.
 *  - Lead with what the visitor gets, then the technology.
 *  - No numbers we can't prove.
 */

const SERVICES = [
  {
    icon: Code2,
    title: "Web apps & APIs",
    body: "Fast, responsive websites and the back-end services behind them, built with Next.js, React, Node.js, Python and PostgreSQL.",
    outcome: "You get a product that works on every screen and is easy to extend.",
  },
  {
    icon: ShieldCheck,
    title: "Security built in",
    body: "Safe logins, protected data, input checks and security reviews from the first line of code, not as an afterthought.",
    outcome: "Fewer surprises, and less risk for your users and your business.",
  },
  {
    icon: Sparkles,
    title: "Practical AI features",
    body: "Smart search, chat assistants and automations that answer from your own content, like the assistant on this site.",
    outcome: "Your users find answers faster; your team saves time.",
  },
];

// Shown only if the database is unreachable or empty.
const FALLBACK_EXPERIENCE = [
  { org: "Z-Gate LTD", role: "Product Manager & Software Engineer", when: "2026 – now" },
  { org: "ALX Africa", role: "ALX Ventures Rwanda Ambassador", when: "2026 – now" },
  { org: "ALX Africa", role: "Software Engineer", when: "2025 – 2026" },
  { org: "EF NEXUS", role: "Software Developer", when: "2025" },
  { org: "Bittwork Technology", role: "Software Engineering Intern", when: "2025" },
  { org: "Rwanda Cancer Relief", role: "Technical Lead (volunteer)", when: "2025 – now" },
];

const LEARNING = [
  "ALX Software Engineering programme",
  "ALX Cybersecurity programme",
  "AWS AI/ML Scholars: Agentic AI engineering (graduate)",
  "Google Cloud skill badges",
];

const year = (d?: string | null) => (d ? new Date(d).getFullYear() : null);

async function loadExperience() {
  const rows = await getExperiences().catch(() => []);
  if (!rows.length) return FALLBACK_EXPERIENCE;
  return rows.slice(0, 6).map((r) => {
    const start = year(r.startDate);
    const end = r.endDate ? year(r.endDate) : "now";
    return {
      org: r.company?.name || "Independent",
      role: r.title,
      when: start ? (start === end ? `${start}` : `${start} – ${end}`) : "",
    };
  });
}

export default async function Home() {
  const [EXPERIENCE, profile, featured] = await Promise.all([loadExperience(), getProfile(), getFeaturedProjects(3)]);
  const personLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE.name,
    jobTitle: "Software Engineer",
    url: SITE.url,
    email: `mailto:${SITE.email}`,
    address: { "@type": "PostalAddress", addressLocality: "Kigali", addressCountry: "RW" },
    sameAs: Object.values(SITE.social),
    knowsAbout: ["Software engineering", "Web development", "Cybersecurity", "Artificial intelligence"],
  };

  return (
    <div className="flex flex-col items-center">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(personLd) }} />

      {/* Hero: who, what, next step */}
      <section aria-labelledby="hero-heading" className="w-full py-20 lg:py-28">
        <div className="container mx-auto px-6 text-center">
          <div className="mb-6 flex flex-wrap justify-center gap-2">
            <p className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-sm text-cyan-300">
              Software Engineer · {profile.location}
            </p>
            {profile.openToWork && (
              <p className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
                {profile.availabilityNote || "Open to work"}
              </p>
            )}
          </div>

          <h1
            id="hero-heading"
            className="mx-auto max-w-4xl text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-6xl"
          >
            {profile.headline}
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
            {profile.bio}
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/projects"
              className="group inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-7 py-3.5 font-semibold text-white transition hover:bg-cyan-500"
            >
              See my projects
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-600 bg-emerald-600/10 px-7 py-3.5 font-semibold text-emerald-300 transition hover:bg-emerald-600/20"
            >
              Get in touch
            </Link>
            <a
              href={profile.cvUrl}
              download
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-7 py-3.5 font-semibold text-slate-300 transition hover:bg-slate-800"
            >
              <FileDown className="h-4 w-4" aria-hidden="true" />
              Download CV
            </a>
          </div>
        </div>
      </section>

      {/* Featured work: projects marked "featured" in the admin */}
      {featured.length > 0 && (
        <section aria-labelledby="featured-heading" className="container mx-auto border-t border-slate-800/50 px-6 py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="featured-heading" className="text-3xl font-bold text-white">Featured work</h2>
              <p className="mt-3 max-w-2xl text-slate-400">A few projects that show how I work, from problem to result.</p>
            </div>
            <Link href="/projects" className="inline-flex items-center gap-2 font-semibold text-cyan-400 hover:text-cyan-300">
              All projects <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {featured.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/projects/${p.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-900/40 p-6 transition hover:border-cyan-500/50"
                >
                  {p.images?.[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.images[0]} alt="" loading="lazy" decoding="async" width={640} height={360} className="mb-5 aspect-video w-full rounded-lg border border-slate-800 object-cover" />
                  )}
                  <span className="text-xs font-medium text-cyan-400">{p.category}</span>
                  <h3 className="mt-2 text-lg font-semibold text-white group-hover:text-cyan-300">{p.title}</h3>
                  {p.tagline && <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">{p.tagline}</p>}
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-300">
                    Read case study <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* What I do: services in outcome language */}
      <section aria-labelledby="services-heading" className="container mx-auto border-t border-slate-800/50 px-6 py-20">
        <h2 id="services-heading" className="text-3xl font-bold text-white">What I can do for you</h2>
        <p className="mt-3 max-w-2xl text-slate-400">Three things I focus on, and what each means for your project.</p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {SERVICES.map(({ icon: Icon, title, body, outcome }) => (
            <article key={title} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-7">
              <Icon className="h-7 w-7 text-cyan-400" aria-hidden="true" />
              <h3 className="mt-5 text-xl font-semibold text-white">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{body}</p>
              <p className="mt-4 border-t border-slate-800 pt-4 text-sm font-medium text-emerald-300">{outcome}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Proof: real roles and learning, straight from the CV */}
      <section aria-labelledby="experience-heading" className="container mx-auto border-t border-slate-800/50 px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 id="experience-heading" className="text-3xl font-bold text-white">Where I&apos;ve worked</h2>
            <ul className="mt-8 divide-y divide-slate-800 rounded-2xl border border-slate-800 bg-slate-900/40">
              {EXPERIENCE.map((e) => (
                <li key={`${e.org}-${e.role}`} className="flex flex-wrap items-baseline justify-between gap-2 px-6 py-4">
                  <span>
                    <span className="font-semibold text-white">{e.org}</span>
                    <span className="text-slate-400"> · {e.role}</span>
                  </span>
                  <span className="text-sm text-slate-500">{e.when}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-white">What I&apos;m learning</h2>
            <ul className="mt-8 space-y-3">
              {LEARNING.map((item) => (
                <li key={item} className="flex gap-3 text-slate-300">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/resume" className="mt-8 inline-flex items-center gap-2 font-semibold text-cyan-400 hover:text-cyan-300">
              Full resume and certificates <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Closing call to action */}
      <section className="container mx-auto px-6 pb-24">
        <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/40 to-slate-900/40 p-10 text-center md:p-14">
          <h2 className="text-3xl font-bold text-white">Have a role or a project in mind?</h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Tell me what you&apos;re working on. {SITE.responseTime}
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-8 py-4 font-semibold text-white transition hover:bg-cyan-500"
          >
            Start a conversation <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
