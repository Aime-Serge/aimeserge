/**
 * Single source of truth for identity, URLs and contact details.
 * Every page, metadata block, sitemap and JSON-LD reads from here,
 * so a change of domain or headline is a one-line edit.
 */
export const SITE = {
  name: "Aime Serge Ukobizaba",
  shortName: "Aime Serge",
  headline: "Software Engineer · Cybersecurity · Agentic AI · Founder, INEZA AI",
  description:
    "Software engineer, innovator and researcher in Kigali, Rwanda. I study the risks facing communities, people and organisations, then build safe, practical technology that reduces them.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://aimeserge.vercel.app").replace(/\/$/, ""),
  email: "aimeserge51260@gmail.com",
  location: "Kigali, Rwanda",
  responseTime: "I reply within 1–2 working days.",
  /** One-line positioning used on the homepage, in metadata and by the AI assistant. */
  positioning: "I find and understand the risks that hold people back, research around them, and build technology that fixes them.",
  social: {
    github: "https://github.com/aime-serge",
    linkedin: "https://www.linkedin.com/in/aimesergeukobizaba/",
    x: "https://x.com/aime__serge",
    instagram: "https://www.instagram.com/_aime_serge/",
  },
} as const;

/** Serialise JSON-LD safely: escapes "<" so DB content can't close the <script> tag. */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
