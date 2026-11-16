import { z } from "zod";
import { SITE } from "./site";

/*
 * Site-wide details and page text edited in Admin → Site settings.
 * SETTINGS_DEFAULT is what the site shows until something is saved, and the
 * fallback if the database can't be reached. Domain and name stay in code
 * (src/config/site.ts) because links and SEO depend on them.
 */

const text = (max: number) => z.string().trim().max(max);
const required = (max: number, msg: string) => z.string().trim().min(1, msg).max(max);
const url = z.string().trim().max(300).refine((v) => v === "" || /^https:\/\/[^\s]+$/.test(v), "Social links must start with https://");

const page = z.object({
  title: required(80, "Every page needs a heading."),
  intro: text(500),
  seoDescription: required(300, "Every page needs a Google description.").refine((v) => v.length >= 50, "Google descriptions work best with at least 50 characters."),
});

export const settingsSchema = z.object({
  identity: z.object({
    positioning: required(200, "Add your one-line positioning."),
    description: required(300, "Add the site description used by Google."),
  }),
  contact: z.object({
    email: z.string().trim().email("Enter a valid email address.").max(200),
    location: required(100, "Add your location."),
    responseTime: text(120),
  }),
  social: z.object({ linkedin: url, github: url, x: url, instagram: url }),
  pages: z.object({ projects: page, research: page, blog: page, contact: page, resume: page }),
  research: z.object({
    steps: z.array(z.object({ title: required(60, "A research step has no title."), body: required(200, "A research step has no text.") })).max(6),
    focusTitle: required(80, "Add a heading for your research areas."),
    focus: z.array(z.object({ title: required(80, "A research area has no title."), body: required(300, "A research area has no text.") })).max(8),
  }),
  resume: z.object({
    skills: z.array(z.object({ name: required(60, "A skill group has no name."), tools: required(300, "A skill group is empty.") })).max(12),
  }),
  seo: z.object({
    /** The content value of Google Search Console's HTML-tag verification. */
    googleVerification: z.string().trim().max(100).regex(/^[A-Za-z0-9_-]*$/, "Paste only the code inside content=\"…\" (letters, numbers, - and _)."),
  }),
});

export type SiteSettings = z.infer<typeof settingsSchema>;

export const SETTINGS_DEFAULT: SiteSettings = {
  identity: { positioning: SITE.positioning, description: SITE.description },
  contact: { email: SITE.email, location: SITE.location, responseTime: SITE.responseTime },
  social: { ...SITE.social },
  pages: {
    projects: {
      title: "Projects",
      intro: "Ventures I've founded, products I've built and problems I've studied. Each story explains the problem, who it helps, what I did and the result.",
      seoDescription: "Ventures, products and research by Aime Serge Ukobizaba, including INEZA AI (health) and DukaAI (small business). Each page explains the problem, who it helps, what was built and the result.",
    },
    research: {
      title: "Research for impact",
      intro: "I study the risks that affect communities, individuals and organisations, measure how big they are, and look for practical ways to reduce them. Each paper starts with a short summary anyone can read.",
      seoDescription: "Research for impact by Aime Serge Ukobizaba: studies of the risks facing communities, people and organisations in climate, health, small business, transport and digital safety, with plain-language summaries.",
    },
    blog: {
      title: "Blog",
      intro: "What I'm building, researching and learning: ventures, health and business tech, security and AI, explained without the jargon.",
      seoDescription: "Articles and short posts by Aime Serge Ukobizaba on building software, security and AI, written in plain language.",
    },
    contact: {
      title: "Let's talk",
      intro: "Hiring, a project, a partnership, or research you want to do together? Send me a short note and I'll get back to you. Community groups, NGOs and students are welcome too.",
      seoDescription: `Get in touch with ${SITE.name} about a job, a project, a partnership or investment, or a research collaboration.`,
    },
    resume: {
      title: "Resume",
      intro: "Where I've worked, what I've studied, and the roles where I've led, taught and built for my community. Every certificate links to the issuer so you can check it.",
      seoDescription: "Experience, research, education and certificates of Aime Serge Ukobizaba, software engineer, innovator and researcher in Kigali, Rwanda. Download the CV as a PDF.",
    },
  },
  research: {
    steps: [
      { title: "Spot the risk", body: "Who is affected, and what could go wrong for them?" },
      { title: "Gather the data", body: "Public records, conversations with the people affected, and open datasets." },
      { title: "Explain the findings", body: "Plain-language results that leaders and the public can use." },
      { title: "Turn it into action", body: "A tool, a product or advice that lowers the risk." },
    ],
    focusTitle: "What I research",
    focus: [
      { title: "Climate risk for communities", body: "How rising heat and less predictable rain affect farming and water in East Africa, using 26 years of public data." },
      { title: "Health access", body: "Where clinics lose time and information, and how one connected system with an assistant can help care teams (INEZA AI)." },
      { title: "Small business and finance", body: "How small shops keep records, and how clearer records can lower costs and make lending safer (DukaAI)." },
      { title: "Digital safety and trustworthy AI", body: "How people and organisations get attacked online, and how to build systems and AI assistants that are safe and accurate by default." },
    ],
  },
  resume: {
    skills: [
      { name: "Back end", tools: "Node.js, Python (Django, DRF), REST and GraphQL APIs, PostgreSQL" },
      { name: "Front end", tools: "React, Next.js, TypeScript, Tailwind CSS" },
      { name: "Security", tools: "Authentication, access control, input validation, security reviews" },
      { name: "Cloud & delivery", tools: "Google Cloud, Vercel, Supabase, Git and CI/CD" },
      { name: "AI", tools: "LLM apps, retrieval-augmented search (RAG), prompt design, agentic and responsible AI" },
      { name: "Research for impact", tools: "Collecting and analysing public data (climate, transport), spotting risks and trends, writing up findings in plain language" },
      { name: "Innovation & product", tools: "Turning a problem into a working product: user research, product and project management, UI/UX and human-centred design" },
      { name: "Languages", tools: "English and Kinyarwanda (native), French and Kiswahili (proficient)" },
    ],
  },
  seo: { googleVerification: process.env.GOOGLE_SITE_VERIFICATION?.trim() || "" },
};

/** Merge saved settings over the defaults group by group, so one bad group never breaks the site. */
export function mergeSettings(saved: unknown): SiteSettings {
  if (!saved || typeof saved !== "object") return SETTINGS_DEFAULT;
  const out = { ...SETTINGS_DEFAULT } as Record<string, unknown>;
  for (const key of Object.keys(SETTINGS_DEFAULT) as Array<keyof SiteSettings>) {
    const part = settingsSchema.shape[key].safeParse((saved as Record<string, unknown>)[key]);
    if (part.success) out[key] = part.data;
  }
  const merged = out as SiteSettings;
  // An env-var verification code still works if none was saved in the admin.
  if (!merged.seo.googleVerification && SETTINGS_DEFAULT.seo.googleVerification) {
    merged.seo = { googleVerification: SETTINGS_DEFAULT.seo.googleVerification };
  }
  return merged;
}

/** Social links that are filled in, in display order. */
export const socialLinks = (s: SiteSettings) =>
  ([["LinkedIn", s.social.linkedin], ["GitHub", s.social.github], ["X (Twitter)", s.social.x], ["Instagram", s.social.instagram]] as const)
    .filter(([, href]) => Boolean(href));
