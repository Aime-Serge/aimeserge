"use client";

import React, { createContext, useContext } from "react";
import Link from "next/link";
import { SITE } from "@/config/site";
import type { TerminalData } from "./types";

/*
 * Terminal commands.
 * Copy rules (docs/CONTENT_GUIDE.md): plain language, innovator/founder first,
 * then research for impact, then how it's built. No numbers we can't prove.
 * All content comes from TerminalData (the same source as the other pages).
 */

export interface TerminalContext {
  data: TerminalData;
  /** Go to a page on this site (after a short pause so the message is seen). */
  navigate: (path: string) => void;
  /** Open a link in a new tab. */
  openExternal: (url: string) => void;
  clear: () => void;
  /** Leave the terminal: back to the page the visitor came from, or the homepage. */
  quit: () => void;
  history: string[];
}

export type Group = "Start here" | "My work" | "Work with me" | "Get around";
export const GROUPS: Group[] = ["Start here", "My work", "Work with me", "Get around"];

export interface CommandDef {
  name: string;
  aliases?: string[];
  group: Group;
  summary: string;
  usage?: string;
  hidden?: boolean;
  /** Values offered by Tab completion for the first argument. */
  completions?: (data: TerminalData) => string[];
  run: (args: string[], ctx: TerminalContext) => React.ReactNode;
}

// ─── Small building blocks ───────────────────────────────────────────────

/** Lets output contain clickable commands (handy on phones). */
export const RunContext = createContext<(command: string) => void>(() => {});

export function Run({ cmd, children }: { cmd: string; children?: React.ReactNode }) {
  const run = useContext(RunContext);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        run(cmd);
      }}
      className="text-cyan-400 underline decoration-dotted underline-offset-4 hover:text-cyan-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
    >
      {children ?? cmd}
    </button>
  );
}

const Title = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-1 font-bold text-white">{children}</div>
);
const Muted = ({ children }: { children: React.ReactNode }) => <span className="text-slate-500">{children}</span>;
const Ok = ({ children }: { children: React.ReactNode }) => <div className="text-emerald-400">{children}</div>;
const Err = ({ children }: { children: React.ReactNode }) => <div className="text-red-400">{children}</div>;
const ExtLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline underline-offset-4 hover:text-cyan-300">
    {children}
  </a>
);
const Next = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-slate-500">
    <span>Next:</span>
    {children}
  </div>
);

function Rows({ rows }: { rows: Array<[React.ReactNode, React.ReactNode]> }) {
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-[auto_1fr]">
      {rows.map(([a, b], i) => (
        <React.Fragment key={i}>
          <div className="text-slate-500 sm:whitespace-nowrap">{a}</div>
          <div className="mb-1 text-slate-300 sm:mb-0">{b}</div>
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Lookups ─────────────────────────────────────────────────────────────

export const PAGES: Record<string, { path: string; label: string }> = {
  home: { path: "/", label: "Homepage" },
  projects: { path: "/projects", label: "All projects" },
  research: { path: "/research", label: "Research papers" },
  blog: { path: "/blog", label: "Articles and posts" },
  resume: { path: "/resume", label: "Experience, education, certificates" },
  contact: { path: "/contact", label: "Contact form" },
};

const TOPICS = {
  hire: "Hiring",
  freelance: "Freelance project",
  partner: "Partnership or investment",
  collaborate: "Research collaboration",
} as const;

const norm = (s: string) => s.toLowerCase().trim();

/** Find by list number ("2"), slug, or the start of the title. */
function pick<T extends { slug: string; title: string }>(list: T[], arg: string): T | undefined {
  const n = Number(arg);
  if (Number.isInteger(n) && n >= 1 && n <= list.length) return list[n - 1];
  const a = norm(arg);
  return (
    list.find((x) => x.slug === a) ??
    list.find((x) => norm(x.title).startsWith(a)) ??
    list.find((x) => norm(x.title).includes(a) || x.slug.includes(a))
  );
}

const isFounder = (role: string) => /founder/i.test(role);

/** Typo help: closest command name within 2 edits. */
export function closest(input: string, names: string[]): string | undefined {
  const dist = (a: string, b: string) => {
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++)
      for (let j = 1; j <= b.length; j++)
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  };
  let best: { name: string; d: number } | undefined;
  for (const name of names) {
    const d = dist(input, name);
    if (d <= 2 && (!best || d < best.d)) best = { name, d };
  }
  return best?.name;
}

// ─── Commands ────────────────────────────────────────────────────────────

function projectDetail(p: TerminalData["projects"][number]) {
  return (
    <div>
      <Title>{p.title}</Title>
      <div className="text-slate-300">{p.tagline}</div>
      <div className="mt-2">
        <Rows
          rows={[
            ["Role", p.role],
            ["When", p.when + (p.isCurrent ? " (ongoing)" : "")],
            ...(p.association ? [["With", p.association] as [string, string]] : []),
            ["Area", p.category],
            ...(p.tools.length ? [["Built with", p.tools.join(", ")] as [string, string]] : []),
          ]}
        />
      </div>
      <p className="mt-2 max-w-3xl text-slate-400">{p.summary}</p>
      <Next>
        <Link href={`/projects/${p.slug}`} className="text-cyan-400 underline underline-offset-4 hover:text-cyan-300">
          Read the full story
        </Link>
        {p.url && <ExtLink href={p.url}>Live link</ExtLink>}
        <Run cmd="projects">All projects</Run>
        {isFounder(p.role) && <Run cmd="partner">Partner or invest</Run>}
      </Next>
    </div>
  );
}

export const COMMANDS: CommandDef[] = [
  // Start here
  {
    name: "about",
    aliases: ["whoami", "me", "intro"],
    group: "Start here",
    summary: "Who I am, in 20 seconds",
    run: (_a, { data }) => (
      <div>
        <Title>Aime Serge Ukobizaba · {data.profile.location}</Title>
        <p className="max-w-3xl text-slate-300">{SITE.positioning}</p>
        <p className="mt-2 max-w-3xl text-slate-400">{data.profile.bio}</p>
        <div className="mt-2 text-slate-300">
          <div>1. <span className="text-white">Innovator and founder</span>: I start things that solve real problems.</div>
          <div>2. <span className="text-white">Research for impact</span>: I study a risk before I build anything.</div>
          <div>3. <span className="text-white">Safe, smart building</span>: software, security and AI are how it happens.</div>
        </div>
        <Next>
          <Run cmd="ventures" /> <Run cmd="impact" /> <Run cmd="projects" /> <Run cmd="cv" />
        </Next>
      </div>
    ),
  },
  {
    name: "ventures",
    aliases: ["startups", "founder"],
    group: "Start here",
    summary: "The companies I founded or co-founded",
    run: (_a, { data }) => {
      const ventures = data.projects.filter((p) => isFounder(p.role));
      const ambassador = data.experience.filter((e) => /ambassador/i.test(e.title));
      return (
        <div>
          <Title>Ventures</Title>
          {ventures.length === 0 && <div className="text-slate-400">No ventures listed yet.</div>}
          {ventures.map((v) => (
            <div key={v.slug} className="mb-2">
              <div>
                <Run cmd={`project ${v.slug}`}>{v.title}</Run> <Muted>· {v.role}</Muted>
              </div>
              <div className="text-slate-400">{v.tagline}</div>
              {v.association && <div className="text-slate-500">{v.association}</div>}
            </div>
          ))}
          {ambassador.map((e) => (
            <div key={e.title} className="mb-2 text-slate-400">
              Also: <span className="text-slate-300">{e.title}</span> ({e.org}, {e.when}), bringing young founders into Rwanda&apos;s startup ecosystem.
            </div>
          ))}
          <Next>
            <Run cmd="partner">Partner or invest</Run> <Run cmd="impact" />
          </Next>
        </div>
      );
    },
  },
  {
    name: "impact",
    aliases: ["why", "mission", "risks"],
    group: "Start here",
    summary: "The risks I work on, and who they affect",
    run: () => (
      <div className="space-y-2">
        <Title>Risk → who it affects → what I do</Title>
        <div>
          <div className="text-white">Communities</div>
          <div className="text-slate-400">Changing rain and rising heat put harvests, water and health at risk. My climate research turns 24 years of East African data into local trends planners can use, and INEZA AI helps clinics follow disease trends by district.</div>
        </div>
        <div>
          <div className="text-white">Individuals</div>
          <div className="text-slate-400">People lose time, money and privacy to services that are slow, hard to use or unsafe. I design simple tools in the languages people speak (Kinyarwanda, French and English) that keep personal data private by default.</div>
        </div>
        <div>
          <div className="text-white">Organisations</div>
          <div className="text-slate-400">Small businesses, clinics and lenders often decide without clear records. DukaAI turns handwritten sales books into records owners and lenders can rely on.</div>
        </div>
        <Next>
          <Run cmd="research" /> <Run cmd="ventures" /> <Run cmd="collaborate">Research with me</Run>
        </Next>
      </div>
    ),
  },
  {
    name: "awards",
    aliases: ["recognition", "achievements", "wins"],
    group: "Start here",
    summary: "Prizes and recognition",
    run: (_a, { data }) => (
      <div>
        <Title>Recognition</Title>
        {data.achievements.length === 0 && <div className="text-slate-400">Nothing listed yet.</div>}
        {data.achievements.map((a) => (
          <div key={a.title} className="text-slate-300">
            • {a.title}
            {(a.issuer || a.year) && <Muted> · {[a.issuer, a.year].filter(Boolean).join(", ")}</Muted>}
          </div>
        ))}
        <Next>
          <Run cmd="ventures" /> <Run cmd="certs" />
        </Next>
      </div>
    ),
  },

  // My work
  {
    name: "projects",
    aliases: ["project", "work", "portfolio"],
    group: "My work",
    summary: "List projects, or show one in detail",
    usage: "projects [number or name]   e.g. projects 1, project dukaai",
    completions: (d) => d.projects.map((p) => p.slug),
    run: (args, { data }) => {
      if (args.length) {
        const p = pick(data.projects, args.join(" "));
        if (!p) return <Err>No project matches &quot;{args.join(" ")}&quot;. Type <Run cmd="projects" /> to see the list.</Err>;
        return projectDetail(p);
      }
      return (
        <div>
          <Title>Projects ({data.projects.length})</Title>
          {data.projects.map((p, i) => (
            <div key={p.slug} className="mb-1">
              <Muted>{String(i + 1).padStart(2, " ")}.</Muted> <Run cmd={`project ${p.slug}`}>{p.title}</Run>{" "}
              <Muted>· {p.category}{p.isCurrent ? " · ongoing" : ""}</Muted>
              <div className="pl-6 text-slate-400">{p.tagline}</div>
            </div>
          ))}
          <div className="mt-2 text-slate-500">Tap a name, or type <span className="text-slate-300">project 1</span>.</div>
        </div>
      );
    },
  },
  {
    name: "research",
    aliases: ["papers", "paper"],
    group: "My work",
    summary: "Research papers, or read one summary",
    usage: "research [number or name]",
    completions: (d) => d.research.map((r) => r.slug),
    run: (args, { data }) => {
      const climate = data.projects.find((p) => /climate/i.test(p.slug));
      if (data.research.length === 0)
        return (
          <div className="text-slate-400">
            Research papers are being prepared for the site.
            {climate && (
              <>
                {" "}Meanwhile, read the climate study: <Run cmd={`project ${climate.slug}`}>{climate.title}</Run>.
              </>
            )}
            <Next>
              <Run cmd="impact" /> <Run cmd="collaborate">Research with me</Run>
            </Next>
          </div>
        );
      if (args.length) {
        const r = pick(data.research, args.join(" "));
        if (!r) return <Err>No paper matches &quot;{args.join(" ")}&quot;. Type <Run cmd="research" /> to see the list.</Err>;
        return (
          <div>
            <Title>{r.title}</Title>
            <Muted>{[r.year, ...r.tags].filter(Boolean).join(" · ")}</Muted>
            <p className="mt-2 max-w-3xl text-slate-300">{r.abstract}</p>
            <Next>
              <Link href={`/research/${r.slug}`} className="text-cyan-400 underline underline-offset-4 hover:text-cyan-300">
                Read the paper
              </Link>
              <Run cmd="collaborate">Research with me</Run>
            </Next>
          </div>
        );
      }
      return (
        <div>
          <Title>Research ({data.research.length})</Title>
          {data.research.map((r, i) => (
            <div key={r.slug} className="mb-1">
              <Muted>{i + 1}.</Muted> <Run cmd={`research ${r.slug}`}>{r.title}</Run> <Muted>· {r.year}</Muted>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    name: "experience",
    aliases: ["resume", "jobs", "roles", "career"],
    group: "My work",
    summary: "Roles and where I've worked",
    run: (_a, { data }) => (
      <div>
        <Title>Experience</Title>
        <Rows
          rows={data.experience.map((e) => [
            e.when,
            <span key={e.title + e.org}>
              <span className="text-white">{e.title}</span> · {e.org}
              {e.volunteer && <Muted> (volunteer)</Muted>}
            </span>,
          ])}
        />
        <Next>
          <Run cmd="cv">Download CV</Run> <Run cmd="open resume">Full resume page</Run> <Run cmd="education" />
        </Next>
      </div>
    ),
  },
  {
    name: "education",
    aliases: ["school", "studies"],
    group: "My work",
    summary: "Education",
    run: (_a, { data }) => (
      <div>
        <Title>Education</Title>
        {data.education.length === 0 && <div className="text-slate-400">See the resume page.</div>}
        <Rows rows={data.education.map((e) => [e.when, `${e.degree}${e.field ? `, ${e.field}` : ""} · ${e.institution}`])} />
        <Next>
          <Run cmd="certs" /> <Run cmd="experience" />
        </Next>
      </div>
    ),
  },
  {
    name: "certs",
    aliases: ["certificates", "certifications", "courses"],
    group: "My work",
    summary: "Certificates and programmes",
    run: (_a, { data }) => (
      <div>
        <Title>Certificates</Title>
        <Rows rows={data.certificates.map((c) => [c.year, `${c.name} · ${c.provider}`])} />
        <Next>
          <Run cmd="skills" /> <Run cmd="open resume">Full resume page</Run>
        </Next>
      </div>
    ),
  },
  {
    name: "skills",
    aliases: ["stack", "tools"],
    group: "My work",
    summary: "What I can do for a team",
    run: () => (
      <div>
        <Title>Skills</Title>
        <Rows
          rows={[
            ["Product & research", "User research, roadmaps, UX analysis, market and risk research"],
            ["Building software", "TypeScript, React / Next.js, Node.js, Python, PostgreSQL / Supabase"],
            ["AI", "Assistants and search that answer from your own documents; Gemini, AWS AI/ML"],
            ["Security", "Safe logins, access control, input checks, security reviews"],
            ["Cloud", "Google Cloud, AWS, Vercel"],
          ]}
        />
        <Next>
          <Run cmd="projects">See them in use</Run> <Run cmd="certs" />
        </Next>
      </div>
    ),
  },
  {
    name: "blog",
    aliases: ["articles", "posts", "read"],
    group: "My work",
    summary: "Latest articles",
    run: (_a, { data }) => {
      if (data.articles.length === 0)
        return (
          <div className="text-slate-400">
            No articles yet. <Run cmd="open blog">Open the blog</Run> for short posts.
          </div>
        );
      return (
        <div>
          <Title>Latest articles</Title>
          {data.articles.slice(0, 6).map((a) => (
            <div key={a.slug} className="mb-1">
              <Link href={`/blog/${a.slug}`} className="text-cyan-400 underline underline-offset-4 hover:text-cyan-300">
                {a.title}
              </Link>{" "}
              <Muted>· {a.date} · {a.minutes} min read</Muted>
              {a.excerpt && <div className="pl-4 text-slate-400">{a.excerpt}</div>}
            </div>
          ))}
          <Next>
            <Run cmd="open blog">All posts</Run>
          </Next>
        </div>
      );
    },
  },

  // Work with me
  {
    name: "contact",
    aliases: ["reach", "talk"],
    group: "Work with me",
    summary: "How to reach me, and the fastest path for you",
    run: () => (
      <div>
        <Title>Let&apos;s talk</Title>
        <Rows
          rows={[
            ["Email", <ExtLink key="e" href={`mailto:${SITE.email}`}>{SITE.email}</ExtLink>],
            ["Based in", SITE.location],
            ["Reply time", SITE.responseTime],
          ]}
        />
        <div className="mt-2 text-slate-300">Pick what fits, and the form opens with your topic ready:</div>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
          <Run cmd="hire">Hire me</Run>
          <Run cmd="freelance">Freelance project</Run>
          <Run cmd="partner">Partner or invest</Run>
          <Run cmd="collaborate">Research together</Run>
          <Run cmd="social">Social links</Run>
        </div>
      </div>
    ),
  },
  {
    name: "hire",
    aliases: ["job", "recruit"],
    group: "Work with me",
    summary: "Offer me a role (opens the form)",
    run: (_a, { navigate }) => {
      navigate(`/contact?topic=${encodeURIComponent(TOPICS.hire)}`);
      return <Ok>Opening the contact form, topic: {TOPICS.hire}…</Ok>;
    },
  },
  {
    name: "freelance",
    aliases: ["client", "build"],
    group: "Work with me",
    summary: "Get something built (opens the form)",
    run: (_a, { navigate }) => {
      navigate(`/contact?topic=${encodeURIComponent(TOPICS.freelance)}`);
      return <Ok>Opening the contact form, topic: {TOPICS.freelance}…</Ok>;
    },
  },
  {
    name: "partner",
    aliases: ["invest", "partnership"],
    group: "Work with me",
    summary: "Partner with or invest in my ventures",
    run: (_a, { navigate }) => {
      navigate(`/contact?topic=${encodeURIComponent(TOPICS.partner)}`);
      return <Ok>Opening the contact form, topic: {TOPICS.partner}…</Ok>;
    },
  },
  {
    name: "collaborate",
    aliases: ["research-together", "collab"],
    group: "Work with me",
    summary: "Research a risk together",
    run: (_a, { navigate }) => {
      navigate(`/contact?topic=${encodeURIComponent(TOPICS.collaborate)}`);
      return <Ok>Opening the contact form, topic: {TOPICS.collaborate}…</Ok>;
    },
  },
  {
    name: "cv",
    aliases: ["resume-pdf", "download"],
    group: "Work with me",
    summary: "Download my CV (PDF)",
    run: (_a, { data, openExternal }) => {
      openExternal(data.profile.cvUrl);
      return (
        <Ok>
          Opening the CV in a new tab. Nothing opened? <ExtLink href={data.profile.cvUrl}>Download it here</ExtLink>.
        </Ok>
      );
    },
  },
  {
    name: "email",
    aliases: ["mail"],
    group: "Work with me",
    summary: "Copy my email address",
    run: () => {
      navigator.clipboard?.writeText(SITE.email).catch(() => {});
      return (
        <div className="text-slate-300">
          <span className="text-emerald-400">Copied:</span> {SITE.email} <Muted>·</Muted>{" "}
          <ExtLink href={`mailto:${SITE.email}`}>open your mail app</ExtLink>
        </div>
      );
    },
  },
  {
    name: "social",
    aliases: ["links", "linkedin", "github"],
    group: "Work with me",
    summary: "LinkedIn, GitHub, X, Instagram",
    run: () => (
      <Rows
        rows={[
          ["LinkedIn", <ExtLink key="l" href={SITE.social.linkedin}>aimesergeukobizaba</ExtLink>],
          ["GitHub", <ExtLink key="g" href={SITE.social.github}>aime-serge</ExtLink>],
          ["X", <ExtLink key="x" href={SITE.social.x}>@aime__serge</ExtLink>],
          ["Instagram", <ExtLink key="i" href={SITE.social.instagram}>@_aime_serge</ExtLink>],
        ]}
      />
    ),
  },
  {
    name: "status",
    aliases: ["available", "availability"],
    group: "Work with me",
    summary: "Am I open to new work?",
    run: (_a, { data }) =>
      data.profile.openToWork ? (
        <div>
          <Ok>Open to new opportunities.</Ok>
          {data.profile.availabilityNote && <div className="text-slate-300">{data.profile.availabilityNote}</div>}
          <Next>
            <Run cmd="hire" /> <Run cmd="freelance" />
          </Next>
        </div>
      ) : (
        <div className="text-slate-300">
          Ask me directly: I read every message. <Run cmd="contact" />
        </div>
      ),
  },

  // Get around
  {
    name: "search",
    aliases: ["find", "grep"],
    group: "Get around",
    summary: "Search projects, research, articles and roles",
    usage: "search <words>   e.g. search health",
    run: (args, { data }) => {
      const q = norm(args.join(" "));
      if (!q) return <Err>Type what to look for, e.g. <span className="text-slate-300">search health</span></Err>;
      const has = (...fields: Array<string | undefined>) => fields.some((f) => f && norm(f).includes(q));
      const hits: Array<{ kind: string; label: string; cmd?: string; href?: string }> = [
        ...data.projects
          .filter((p) => has(p.title, p.tagline, p.summary, p.category, p.role, p.association, p.tools.join(" ")))
          .map((p) => ({ kind: "Project", label: p.title, cmd: `project ${p.slug}` })),
        ...data.research
          .filter((r) => has(r.title, r.abstract, r.tags.join(" ")))
          .map((r) => ({ kind: "Research", label: r.title, cmd: `research ${r.slug}` })),
        ...data.articles
          .filter((a) => has(a.title, a.excerpt))
          .map((a) => ({ kind: "Article", label: a.title, href: `/blog/${a.slug}` })),
        ...data.experience
          .filter((e) => has(e.title, e.org))
          .map((e) => ({ kind: "Role", label: `${e.title} · ${e.org}`, cmd: "experience" })),
      ];
      if (!hits.length) return <div className="text-slate-400">Nothing found for &quot;{q}&quot;. Try a shorter word, or <Run cmd="projects" />.</div>;
      return (
        <div>
          <Title>{hits.length} result{hits.length === 1 ? "" : "s"} for &quot;{q}&quot;</Title>
          {hits.slice(0, 12).map((h, i) => (
            <div key={i}>
              <Muted>{h.kind.padEnd(9, " ")}</Muted>{" "}
              {h.cmd ? (
                <Run cmd={h.cmd}>{h.label}</Run>
              ) : (
                <Link href={h.href!} className="text-cyan-400 underline underline-offset-4">{h.label}</Link>
              )}
            </div>
          ))}
        </div>
      );
    },
  },
  {
    name: "open",
    aliases: ["cd", "goto", "go"],
    group: "Get around",
    summary: "Open a page, project or paper",
    usage: "open <page | project | paper>   e.g. open resume, open ineza-ai",
    completions: (d) => [...Object.keys(PAGES), ...d.projects.map((p) => p.slug), ...d.research.map((r) => r.slug)],
    run: (args, { data, navigate }) => {
      const raw = norm(args.join(" "));
      if (!raw) return COMMANDS.find((c) => c.name === "ls")!.run([], { data, navigate } as TerminalContext);
      // "/", "~", "..", "/projects" all work like a real shell.
      const target = raw.replace(/^\/+/, "").replace(/^(~|\.\.?|)$/, "home");
      const page = PAGES[target];
      const project = !page ? pick(data.projects, target) : undefined;
      const paper = !page && !project ? pick(data.research, target) : undefined;
      const path = page?.path ?? (project && `/projects/${project.slug}`) ?? (paper && `/research/${paper.slug}`);
      if (!path) return <Err>Nothing called &quot;{target}&quot;. Type <Run cmd="ls" /> to see the pages.</Err>;
      navigate(path);
      return <Ok>Opening {page?.label ?? project?.title ?? paper?.title}…</Ok>;
    },
  },
  {
    name: "ls",
    aliases: ["pages", "dir", "menu"],
    group: "Get around",
    summary: "List the pages of this site",
    run: () => (
      <div>
        <Rows rows={Object.entries(PAGES).map(([k, v]) => [<Run key={k} cmd={`open ${k}`}>{k}</Run>, v.label])} />
        <div className="mt-2 text-slate-500">Type <span className="text-slate-300">open resume</span>, or tap a name.</div>
      </div>
    ),
  },
  {
    name: "exit",
    aliases: ["quit", "q", "logout", "close"],
    group: "Get around",
    summary: "Leave the terminal (Ctrl+D)",
    run: (_a, { quit }) => {
      quit();
      return <Ok>Closing the terminal…</Ok>;
    },
  },
  {
    name: "home",
    aliases: ["gui"],
    group: "Get around",
    summary: "Back to the normal website",
    run: (_a, { navigate }) => {
      navigate("/");
      return <Ok>Back to the homepage…</Ok>;
    },
  },
  {
    name: "history",
    group: "Get around",
    summary: "Commands you've typed (↑ ↓ to reuse)",
    run: (_a, { history }) =>
      history.length ? (
        <div>
          {history.map((h, i) => (
            <div key={i}>
              <Muted>{String(i + 1).padStart(3, " ")}</Muted> <Run cmd={h}>{h}</Run>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-slate-400">No commands yet.</div>
      ),
  },
  {
    name: "clear",
    aliases: ["cls"],
    group: "Get around",
    summary: "Clear the screen (Ctrl+L)",
    run: (_a, { clear }) => {
      clear();
      return null;
    },
  },

  // Hidden extras: small rewards for curious visitors.
  {
    name: "sudo",
    group: "Get around",
    hidden: true,
    summary: "",
    run: () => (
      <div className="text-amber-400">
        Permission denied: only I have admin rights here. You can still <Run cmd="hire">hire me</Run>, though.
      </div>
    ),
  },
  {
    name: "hello",
    aliases: ["hi", "hey", "muraho", "bonjour"],
    group: "Start here",
    hidden: true,
    summary: "",
    run: () => (
      <div className="text-slate-300">
        Muraho! Hello! Bonjour! Thanks for stopping by. Start with <Run cmd="about" />.
      </div>
    ),
  },
];

// help is defined last so it can list every other command.
COMMANDS.push({
  name: "help",
  aliases: ["?", "commands", "man"],
  group: "Get around",
  summary: "Show all commands, or how to use one",
  usage: "help [command]   e.g. help projects",
  completions: () => COMMANDS.filter((c) => !c.hidden).map((c) => c.name),
  run: (args) => {
    if (args.length) {
      const c = findCommand(args[0]);
      if (!c) return <Err>No command called &quot;{args[0]}&quot;.</Err>;
      return (
        <div>
          <Title>{c.name}</Title>
          <div className="text-slate-300">{c.summary}</div>
          {c.usage && <div className="mt-1 text-slate-400">Usage: {c.usage}</div>}
          {c.aliases?.length ? <div className="text-slate-500">Also works: {c.aliases.join(", ")}</div> : null}
        </div>
      );
    }
    return (
      <div className="space-y-3">
        {GROUPS.map((g) => (
          <div key={g}>
            <div className="mb-1 text-white">{g}</div>
            <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-[8rem_1fr]">
              {COMMANDS.filter((c) => c.group === g && !c.hidden).map((c) => (
                <React.Fragment key={c.name}>
                  <div><Run cmd={c.name} /></div>
                  <div className="mb-1 text-slate-400 sm:mb-0">{c.summary}</div>
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
        <div className="text-slate-500">
          Tips: tap any cyan word · Tab completes · ↑ ↓ recall commands · <span className="text-slate-300">help projects</span> explains one · <Run cmd="clear" /> (Ctrl+L) wipes the screen · <Run cmd="exit" /> (Ctrl+D) leaves
        </div>
      </div>
    );
  },
});

const INDEX = new Map<string, CommandDef>();
for (const c of COMMANDS) for (const n of [c.name, ...(c.aliases ?? [])]) INDEX.set(n, c);

export function findCommand(name: string): CommandDef | undefined {
  return INDEX.get(norm(name));
}

/** Every name a visitor might type (for typo help and Tab completion). */
export const ALL_NAMES = [...INDEX.keys()];
export const VISIBLE_NAMES = COMMANDS.filter((c) => !c.hidden).map((c) => c.name);
