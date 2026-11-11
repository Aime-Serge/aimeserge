/**
 * The small, serialisable slice of site content the terminal needs.
 * Built on the server (src/app/(portfolio)/terminal/page.tsx) from the same
 * queries as the rest of the site, so it always matches the other pages.
 */
export interface TerminalData {
  profile: {
    bio: string;
    location: string;
    openToWork: boolean;
    availabilityNote: string;
    cvUrl: string;
  };
  projects: Array<{
    slug: string;
    title: string;
    tagline: string;
    role: string;
    category: string;
    summary: string;
    tools: string[];
    url?: string;
    association?: string;
    isCurrent: boolean;
    when: string;
  }>;
  research: Array<{ slug: string; title: string; abstract: string; tags: string[]; year: string }>;
  experience: Array<{ title: string; org: string; when: string; current: boolean; volunteer: boolean }>;
  education: Array<{ degree: string; field?: string; institution: string; when: string }>;
  certificates: Array<{ name: string; provider: string; year: string }>;
  achievements: Array<{ title: string; issuer?: string; year?: string }>;
  articles: Array<{ slug: string; title: string; excerpt?: string; minutes: number; date: string }>;
}
