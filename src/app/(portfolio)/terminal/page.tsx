import TerminalUI from "@/presentation/components/features/TerminalUI";
import type { TerminalData } from "@/presentation/components/features/terminal/types";
import {
  getAchievements, getCertificates, getEducations, getExperiences,
  getProfile, getProjects, getPublishedArticles,
} from "@/core/domain/portfolio/queries";
import { getResearch } from "@/core/domain/research/queries";

// Static page, refreshed when content changes in the admin (or daily).
export const revalidate = 86400;

export const metadata = {
  title: "Terminal",
  description: "Explore Aime Serge's portfolio by typing commands, for people who like the command line.",
  alternates: { canonical: "/terminal" },
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-03-01" → "Mar 2026", "2025" → "2025". Parsed as text, so no timezone shifts. */
function monthYear(d?: string | null): string {
  if (!d) return "";
  const year = d.slice(0, 4);
  const month = Number(d.slice(5, 7));
  return month >= 1 && month <= 12 ? `${MONTHS[month - 1]} ${year}` : year;
}

function span(start?: string | null, end?: string | null): string {
  const a = monthYear(start);
  const b = end ? monthYear(end) : "now";
  return !a ? b : a === b ? a : `${a} – ${b}`;
}

const trim = (s: string, max: number) => (s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s);

async function getTerminalData(): Promise<TerminalData> {
  const [profile, projects, research, experiences, educations, certificates, achievements, articles] = await Promise.all([
    getProfile(), getProjects(), getResearch(), getExperiences(), getEducations(),
    getCertificates(), getAchievements(), getPublishedArticles(10),
  ]);

  return {
    profile: {
      bio: profile.bio,
      location: profile.location,
      openToWork: profile.openToWork,
      availabilityNote: profile.availabilityNote,
      cvUrl: profile.cvUrl,
    },
    projects: projects
      .filter((p) => p.isVisible !== false)
      .map((p) => {
        const start = [p.startDate?.month?.slice(0, 3), p.startDate?.year].filter(Boolean).join(" ");
        const end = p.isCurrent ? "now" : [p.endDate?.month?.slice(0, 3), p.endDate?.year].filter(Boolean).join(" ");
        return {
          slug: p.slug,
          title: p.title,
          tagline: p.tagline,
          role: p.role,
          category: p.category,
          summary: trim(p.summary || p.description || "", 420),
          tools: p.tools ?? [],
          url: p.url || undefined,
          association: p.association || undefined,
          isCurrent: Boolean(p.isCurrent),
          when: !start ? end : !end || start === end ? start : `${start} – ${end}`,
        };
      }),
    research: research.map((r) => ({
      slug: r.slug,
      title: r.title,
      abstract: trim(r.abstract || "", 500),
      tags: r.tags ?? [],
      year: (r.publicationDate || r.createdAt || "").slice(0, 4),
    })),
    // Current roles first, then newest first.
    experience: [...experiences]
      .sort((a, b) => Number(!a.endDate) === Number(!b.endDate)
        ? b.startDate.localeCompare(a.startDate)
        : a.endDate ? 1 : -1)
      .map((e) => ({
        title: e.title,
        org: e.company?.name ?? "",
        when: span(e.startDate, e.endDate),
        current: !e.endDate,
        volunteer: e.employmentType === "VOLUNTEER",
      })),
    education: educations.map((e) => ({
      degree: e.degree,
      field: e.fieldOfStudy,
      institution: e.institution?.name ?? "",
      when: span(e.startDate?.slice(0, 4), e.endDate?.slice(0, 4)),
    })),
    certificates: certificates.map((c) => ({ name: c.name, provider: c.provider, year: (c.issueDate || "").slice(0, 4) })),
    achievements: achievements.map((a) => ({ title: a.title, issuer: a.issuer, year: a.achievedDate?.slice(0, 4) })),
    articles: articles.map((a) => ({
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt ? trim(a.excerpt, 160) : undefined,
      minutes: a.estimatedReadTime || 1,
      date: monthYear(a.publishedAt || a.createdAt),
    })),
  };
}

export default async function TerminalPage() {
  const data = await getTerminalData();

  return (
    <div className="container mx-auto flex min-h-[85vh] items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white font-mono">
            Terminal
          </h1>
          <p className="mt-2 text-slate-400">A fun way to browse this site. Type <code className="text-cyan-400">help</code> to see the commands.</p>
        </div>
        <TerminalUI data={data} />
      </div>
    </div>
  );
}
