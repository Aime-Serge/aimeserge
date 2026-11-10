import Link from "next/link";
import {
  ArrowRight, FileDown, Lightbulb, Microscope, ShieldCheck, Sprout, User, Store,
  Ear, Hammer, TrendingUp, Trophy, Briefcase, Handshake, FlaskConical,
} from "lucide-react";
import { SITE, jsonLd } from "@/config/site";
import { getExperiences, getProfile, getFeaturedProjects } from "@/core/domain/portfolio/queries";

// Static HTML, refreshed when the profile, projects or experiences change in the admin (or daily).
export const revalidate = 86400;

/*
 * Homepage copy rules (see docs/CONTENT_GUIDE.md):
 *  - Positioning: innovator and founder, researcher for impact, safe builder.
 *  - Every claim must be checkable on the CV, a linked project or a public post.
 *  - Lead with the risk a person faces and what changes for them, then the technology.
 *  - No numbers we can't prove.
 */

// Facts only. Each one is on the CV, a project page or a public LinkedIn post.
const RECOGNITION = [
  { text: "2nd place, Hacktoberfest Hack Day Kigali 2026", detail: "with DukaAI" },
  { text: "4th place, Innovate With Google Cloud Hackathon", detail: "Google Cloud" },
  { text: "Building INEZA AI with ALU's CHII", detail: "Africa Health Collaborative" },
  { text: "ALX Ventures Rwanda Ambassador", detail: "since 2026" },
];

const PILLARS = [
  {
    icon: Lightbulb,
    title: "Innovate: from idea to venture",
    body: "I look for problems people live with every day and turn them into products. I founded INEZA AI, a health system for clinics, and co-founded DukaAI, which helps small shops keep clear records.",
    outcome: "A real product, tested with the people it is for.",
  },
  {
    icon: Microscope,
    title: "Research for impact",
    body: "Before I build, I study the problem: who is at risk, how big the risk is, and why. That ranges from 24 years of East African climate data to how shop owners keep their books. I share what I find in plain language.",
    outcome: "Decisions based on evidence, not guesses.",
  },
  {
    icon: ShieldCheck,
    title: "Build it safe and smart",
    body: "Web apps, APIs and AI assistants with security built in from day one: safe logins, protected data and checks on everything people type in. Built with Next.js, Python and PostgreSQL.",
    outcome: "Technology people can trust with their data.",
  },
];

// Who the work protects: the risk, then what I do about it.
const AUDIENCES = [
  {
    icon: Sprout,
    who: "Communities",
    risk: "Changing rain and rising heat put harvests, water and health at risk.",
    action: "My climate research turns 24 years of East African data into local trends that planners can use. INEZA AI helps clinics follow disease trends by district.",
    href: "/research",
    linkText: "See the research",
  },
  {
    icon: User,
    who: "Individuals",
    risk: "People lose time, money and privacy to services that are slow, hard to use or unsafe.",
    action: "I design simple tools that work in the languages people speak (Kinyarwanda, French and English) and keep personal data private by default.",
    href: "/projects",
    linkText: "See the projects",
  },
  {
    icon: Store,
    who: "Organisations",
    risk: "Small businesses, clinics and lenders often decide without clear records.",
    action: "DukaAI turns handwritten sales books into records owners and lenders can rely on. For teams, I build secure web apps and AI assistants that answer from their own documents.",
    href: "/projects/dukaai",
    linkText: "See DukaAI",
  },
];

const STEPS = [
  { icon: Ear, title: "Listen", body: "Talk to the people who face the problem: health workers, shop owners, users." },
  { icon: Microscope, title: "Research", body: "Gather the data and find the real risk: how big it is and who it affects." },
  { icon: Hammer, title: "Build", body: "Make the simplest safe tool that solves it, and test it with real users." },
  { icon: TrendingUp, title: "Measure and improve", body: "Check what changed, share what I learned, and make it better." },
];

const WAYS_TO_WORK = [
  { icon: Briefcase, title: "Hire me", body: "Full-time roles, product work or a freelance project.", topic: "Hiring" },
  { icon: Handshake, title: "Partner or invest", body: "Co-build, pilot or support INEZA AI, DukaAI or a new idea.", topic: "Partnership or investment" },
  { icon: FlaskConical, title: "Research together", body: "Studies on climate, health, small business or digital safety.", topic: "Research collaboration" },
];

// Shown only if the database is unreachable or empty.
const FALLBACK_EXPERIENCE = [
  { org: "INEZA AI", role: "Founder & Product Manager", when: "2026 – now" },
  { org: "DukaAI", role: "Co-Founder & UX Analyst", when: "2026 – now" },
  { org: "Z-Gate LTD", role: "Assistant Product Manager", when: "2026 – now" },
  { org: "Innovation Hacks", role: "Full-stack Developer Intern", when: "2026" },
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
    jobTitle: "Software Engineer and Founder",
    url: SITE.url,
    email: `mailto:${SITE.email}`,
    address: { "@type": "PostalAddress", addressLocality: "Kigali", addressCountry: "RW" },
    sameAs: Object.values(SITE.social),
    founder: [
      { "@type": "Organization", name: "INEZA AI" },
      { "@type": "Organization", name: "DukaAI" },
    ],
    knowsAbout: [
      "Software engineering", "Product innovation", "Entrepreneurship", "Cybersecurity",
      "Artificial intelligence", "Climate data research", "Digital health", "Risk analysis",
    ],
  };

  return (
    <div className="flex flex-col items-center">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(personLd) }} />

      {/* Hero: who, what, next step */}
      <section aria-labelledby="hero-heading" className="w-full py-20 lg:py-28">
        <div className="container mx-auto px-6 text-center">
          <div className="mb-6 flex flex-wrap justify-center gap-2">
            <p className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-sm text-cyan-300">
              Founder · Software Engineer · Researcher · {profile.location}
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
            className="mx-auto max-w-4xl text-3xl font-bold leading-[1.15] tracking-tight text-white sm:text-5xl"
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
              See my ventures and projects
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

          {/* Recognition: quick, checkable proof */}
          <ul aria-label="Recognition" className="mx-auto mt-14 grid max-w-5xl gap-3 text-left sm:grid-cols-2 lg:grid-cols-4">
            {RECOGNITION.map((r) => (
              <li key={r.text} className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3">
                <Trophy className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
                <span>
                  <span className="block text-sm font-medium text-slate-200">{r.text}</span>
                  <span className="block text-xs text-slate-500">{r.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Three pillars: innovator, researcher, safe builder */}
      <section aria-labelledby="pillars-heading" className="container mx-auto border-t border-slate-800/50 px-6 py-20">
        <h2 id="pillars-heading" className="text-3xl font-bold text-white">Three ways I create impact</h2>
        <p className="mt-3 max-w-2xl text-slate-400">I start new things, I study problems before I solve them, and I build so people stay safe.</p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {PILLARS.map(({ icon: Icon, title, body, outcome }) => (
            <article key={title} className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/40 p-7">
              <Icon className="h-7 w-7 text-cyan-400" aria-hidden="true" />
              <h3 className="mt-5 text-xl font-semibold text-white">{title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-400">{body}</p>
              <p className="mt-4 border-t border-slate-800 pt-4 text-sm font-medium text-emerald-300">{outcome}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Featured ventures and projects: marked "featured" in the admin */}
      {featured.length > 0 && (
        <section aria-labelledby="featured-heading" className="container mx-auto border-t border-slate-800/50 px-6 py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="featured-heading" className="text-3xl font-bold text-white">Ventures and featured work</h2>
              <p className="mt-3 max-w-2xl text-slate-400">What I&apos;m building now, and the problem each one solves.</p>
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
                    Read the story <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Who the work protects: risk first, then action */}
      <section aria-labelledby="audiences-heading" className="container mx-auto border-t border-slate-800/50 px-6 py-20">
        <h2 id="audiences-heading" className="text-3xl font-bold text-white">Who my work protects</h2>
        <p className="mt-3 max-w-2xl text-slate-400">
          Every project starts with a risk that someone faces. Here is who I work for, and what I do about it.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {AUDIENCES.map(({ icon: Icon, who, risk, action, href, linkText }) => (
            <article key={who} className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/40 p-7">
              <div className="flex items-center gap-3">
                <Icon className="h-6 w-6 text-emerald-400" aria-hidden="true" />
                <h3 className="text-xl font-semibold text-white">{who}</h3>
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500">The risk</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-300">{risk}</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">What I do</p>
              <p className="mt-1 flex-1 text-sm leading-relaxed text-slate-400">{action}</p>
              <Link href={href} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300">
                {linkText} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* How I work: a workflow any stakeholder can follow */}
      <section aria-labelledby="process-heading" className="container mx-auto border-t border-slate-800/50 px-6 py-20">
        <h2 id="process-heading" className="text-3xl font-bold text-white">How I work</h2>
        <p className="mt-3 max-w-2xl text-slate-400">The same four steps, whether it&apos;s a research study, a new venture or a client project.</p>

        <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <li key={title} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-600/20 text-sm font-bold text-cyan-300" aria-hidden="true">
                  {i + 1}
                </span>
                <Icon className="h-5 w-5 text-cyan-400" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Proof: real roles and learning, straight from the CV */}
      <section aria-labelledby="experience-heading" className="container mx-auto border-t border-slate-800/50 px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 id="experience-heading" className="text-3xl font-bold text-white">Where I&apos;ve worked and led</h2>
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

      {/* Closing call to action: three clear paths */}
      <section aria-labelledby="cta-heading" className="container mx-auto px-6 pb-24">
        <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/40 to-slate-900/40 p-8 md:p-14">
          <h2 id="cta-heading" className="text-center text-3xl font-bold text-white">Let&apos;s build something that matters</h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-slate-400">
            Pick what fits, and tell me a little about it. {SITE.responseTime}
          </p>
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {WAYS_TO_WORK.map(({ icon: Icon, title, body, topic }) => (
              <li key={title}>
                <Link
                  href={`/contact?topic=${encodeURIComponent(topic)}`}
                  className="group flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-950/60 p-6 transition hover:border-cyan-500/50"
                >
                  <Icon className="h-6 w-6 text-cyan-400" aria-hidden="true" />
                  <span className="mt-4 text-lg font-semibold text-white group-hover:text-cyan-300">{title}</span>
                  <span className="mt-2 flex-1 text-sm text-slate-400">{body}</span>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-cyan-400">
                    Start here <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
