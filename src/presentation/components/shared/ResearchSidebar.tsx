import Link from "next/link";
import { ArrowRight, FlaskConical } from "lucide-react";
import { type ResearchPaper } from "@/core/domain/research/types";

interface ResearchSidebarProps {
  papers: ResearchPaper[];
}

// Studies published as project case studies, so visitors always have something to read.
const STUDIES = [
  { title: "Climate change in East Africa, 2000–2026", href: "/projects/climate-modeling-east-africa" },
  { title: "Real-time data for urban transit in Kigali", href: "/projects/urban-mobility-iot" },
  { title: "INEZA AI: connected care for clinics", href: "/projects/ineza-ai" },
  { title: "DukaAI: clear records for small shops", href: "/projects/dukaai" },
];

export default function ResearchSidebar({ papers }: ResearchSidebarProps) {
  // Topics come from the papers' tags, most common first.
  const counts = papers.reduce((acc: Record<string, number>, paper) => {
    paper.tags.forEach((tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {});
  const topics = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const totalDownloads = papers.reduce((acc, p) => acc + (p.downloads || 0), 0);

  return (
    <aside className="space-y-8">
      {topics.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-emerald-500/5 p-6">
          <h2 className="mb-4 text-sm font-semibold text-white">Topics</h2>
          <ul className="space-y-3">
            {topics.map(([name, count]) => (
              <li key={name} className="flex items-center justify-between text-sm text-slate-400">
                <span>{name}</span>
                <span className="text-slate-600">
                  {count} {count === 1 ? "paper" : "papers"}
                </span>
              </li>
            ))}
          </ul>
          {totalDownloads > 0 && (
            <p className="mt-6 border-t border-slate-800 pt-4 text-xs text-slate-500">
              Papers downloaded {totalDownloads.toLocaleString()} times so far.
            </p>
          )}
        </div>
      )}

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <h2 className="mb-4 text-sm font-semibold text-white">Studies you can read now</h2>
        <ul className="space-y-3">
          {STUDIES.map((s) => (
            <li key={s.href}>
              <Link href={s.href} className="group flex items-start gap-2 text-sm text-slate-400 hover:text-emerald-400">
                <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                {s.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
        <FlaskConical className="h-6 w-6 text-emerald-400" aria-hidden="true" />
        <h2 className="mt-3 text-base font-semibold text-white">Research with me</h2>
        <p className="mt-2 text-sm text-slate-400">
          Working on a risk that affects a community, a group of people or an organisation? Let&apos;s study it together.
        </p>
        <Link
          href={`/contact?topic=${encodeURIComponent("Research collaboration")}`}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
        >
          Propose a study <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </aside>
  );
}
