import { z } from "zod";

/*
 * Homepage sections that the admin can edit (Admin → Homepage sections).
 * HOMEPAGE_DEFAULT is what the site shows until something is saved, and the
 * fallback if the database can't be reached.
 *
 * Copy rules (docs/CONTENT_GUIDE.md): plain language, every claim checkable,
 * risk first then action, no numbers we can't prove.
 */

/** Icons the admin can pick from (names map to lucide icons in components/shared/HomeIcon.tsx). */
export const HOME_ICONS = [
  "Lightbulb", "Microscope", "ShieldCheck", "Sprout", "User", "Users", "Store", "Ear", "Hammer",
  "TrendingUp", "Trophy", "Briefcase", "Handshake", "FlaskConical", "HeartPulse", "Flame", "Globe",
  "Rocket", "Code", "Brain", "GraduationCap", "Building2", "Leaf", "Lock", "Target", "Award",
  "Cpu", "Smartphone", "BookOpen", "Megaphone",
] as const;
export type HomeIconName = (typeof HOME_ICONS)[number];

const text = (max: number) => z.string().trim().max(max);
const required = (max: number, msg: string) => z.string().trim().min(1, msg).max(max);
const icon = z.enum(HOME_ICONS);
/** Internal path (/projects) or full https link. */
const link = z.string().trim().max(300).regex(/^(\/[^\s]*|https:\/\/[^\s]+)$/, "Links must start with / or https://");

const section = z.object({
  visible: z.boolean(),
  title: required(120, "Every section needs a heading."),
  intro: text(400),
});

export const homepageSchema = z.object({
  recognition: z.object({
    visible: z.boolean(),
    items: z.array(z.object({ text: required(120, "Recognition text is empty."), detail: text(80) })).max(8),
  }),
  pillars: section.extend({
    items: z.array(z.object({
      icon, title: required(80, "A pillar has no title."), body: required(500, "A pillar has no text."), outcome: text(160),
    })).max(6),
  }),
  audiences: section.extend({
    items: z.array(z.object({
      icon, who: required(60, "A card has no 'who'."), risk: required(300, "A card has no risk."),
      action: required(500, "A card has no 'what I do'."), href: link, linkText: required(60, "A card has no link text."),
    })).max(6),
  }),
  featured: section,
  steps: section.extend({
    items: z.array(z.object({ icon, title: required(60, "A step has no title."), body: required(300, "A step has no text.") })).max(8),
  }),
  experience: section.extend({
    learningTitle: required(120, "The learning list needs a heading."),
    learning: z.array(required(160, "A learning item is empty.")).max(12),
  }),
  cta: section.extend({
    items: z.array(z.object({
      icon, title: required(60, "An option has no title."), body: required(200, "An option has no text."),
      topic: z.enum(["Hiring", "Freelance project", "Partnership or investment", "Research collaboration", "Other"]),
    })).max(4),
  }),
});

export type HomepageContent = z.infer<typeof homepageSchema>;

export const HOMEPAGE_DEFAULT: HomepageContent = {
  recognition: {
    visible: true,
    items: [
      { text: "2nd place, Hacktoberfest Hack Day Kigali 2026", detail: "with DukaAI" },
      { text: "4th place, Innovate With Google Cloud Hackathon", detail: "Google Cloud" },
      { text: "Building INEZA AI with ALU's CHII", detail: "Africa Health Collaborative" },
      { text: "ALX Ventures Rwanda Ambassador", detail: "since 2026" },
    ],
  },
  pillars: {
    visible: true,
    title: "Three ways I create impact",
    intro: "I start new things, I study problems before I solve them, and I build so people stay safe.",
    items: [
      {
        icon: "Lightbulb",
        title: "Innovate: from idea to venture",
        body: "I look for problems people live with every day and turn them into products. I founded INEZA AI, a health system for clinics, and co-founded DukaAI, which helps small shops keep clear records.",
        outcome: "A real product, tested with the people it is for.",
      },
      {
        icon: "Microscope",
        title: "Research for impact",
        body: "Before I build, I study the problem: who is at risk, how big the risk is, and why. That ranges from 26 years of East African climate data to how shop owners keep their books. I share what I find in plain language.",
        outcome: "Decisions based on evidence, not guesses.",
      },
      {
        icon: "ShieldCheck",
        title: "Build it safe and smart",
        body: "Web apps, APIs and AI assistants with security built in from day one: safe logins, protected data and checks on everything people type in. Built with Next.js, Python and PostgreSQL.",
        outcome: "Technology people can trust with their data.",
      },
    ],
  },
  featured: {
    visible: true,
    title: "Ventures and featured work",
    intro: "What I'm building now, and the problem each one solves.",
  },
  audiences: {
    visible: true,
    title: "Who my work protects",
    intro: "Every project starts with a risk that someone faces. Here is who I work for, and what I do about it.",
    items: [
      {
        icon: "Sprout",
        who: "Communities",
        risk: "Changing rain and rising heat put harvests, water and health at risk.",
        action: "My climate research turns 26 years of East African data into local trends that planners can use. INEZA AI helps clinics follow disease trends by district.",
        href: "/research",
        linkText: "See the research",
      },
      {
        icon: "User",
        who: "Individuals",
        risk: "People lose time, money and privacy to services that are slow, hard to use or unsafe.",
        action: "I design simple tools that work in the languages people speak (Kinyarwanda, French and English) and keep personal data private by default.",
        href: "/projects",
        linkText: "See the projects",
      },
      {
        icon: "Store",
        who: "Organisations",
        risk: "Small businesses, clinics and lenders often decide without clear records.",
        action: "DukaAI turns handwritten sales books into records owners and lenders can rely on. For teams, I build secure web apps and AI assistants that answer from their own documents.",
        href: "/projects/dukaai",
        linkText: "See DukaAI",
      },
    ],
  },
  steps: {
    visible: true,
    title: "How I work",
    intro: "The same four steps, whether it's a research study, a new venture or a client project.",
    items: [
      { icon: "Ear", title: "Listen", body: "Talk to the people who face the problem: health workers, shop owners, users." },
      { icon: "Microscope", title: "Research", body: "Gather the data and find the real risk: how big it is and who it affects." },
      { icon: "Hammer", title: "Build", body: "Make the simplest safe tool that solves it, and test it with real users." },
      { icon: "TrendingUp", title: "Measure and improve", body: "Check what changed, share what I learned, and make it better." },
    ],
  },
  experience: {
    visible: true,
    title: "Where I've worked and led",
    intro: "",
    learningTitle: "What I'm learning",
    learning: [
      "ALX Software Engineering programme",
      "ALX Cybersecurity programme",
      "AWS AI/ML Scholars: Agentic AI engineering (graduate)",
      "Google Cloud skill badges",
    ],
  },
  cta: {
    visible: true,
    title: "Let's build something that matters",
    intro: "Pick what fits, and tell me a little about it.",
    items: [
      { icon: "Briefcase", title: "Hire me", body: "Full-time roles, product work or a freelance project.", topic: "Hiring" },
      { icon: "Handshake", title: "Partner or invest", body: "Co-build, pilot or support INEZA AI, DukaAI or a new idea.", topic: "Partnership or investment" },
      { icon: "FlaskConical", title: "Research together", body: "Studies on climate, health, small business or digital safety.", topic: "Research collaboration" },
    ],
  },
};

/**
 * Merge saved content over the defaults section by section, so a partly saved
 * or older document never leaves a section empty or breaks the page.
 */
export function mergeHomepage(saved: unknown): HomepageContent {
  if (!saved || typeof saved !== "object") return HOMEPAGE_DEFAULT;
  const out = { ...HOMEPAGE_DEFAULT } as Record<string, unknown>;
  for (const key of Object.keys(HOMEPAGE_DEFAULT) as Array<keyof HomepageContent>) {
    const part = homepageSchema.shape[key].safeParse((saved as Record<string, unknown>)[key]);
    if (part.success) out[key] = part.data;
  }
  return out as HomepageContent;
}
