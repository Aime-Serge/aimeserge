import { getResearch } from "@/core/domain/research/queries";
import ResearchFeed from "@/presentation/components/features/ResearchFeed";
import ResearchSidebar from "@/presentation/components/shared/ResearchSidebar";

export const metadata = {
  title: "Technical Research | Aime Serge",
  description: "Independent research on cloud infrastructure, proactive security, and autonomous systems. Published papers, whitepapers, and technical analysis advancing distributed systems thinking.",
};

export default async function ResearchPage() {
  const researchPapers = await getResearch();

  return (
    <div className="container mx-auto px-6 py-12 lg:py-20">
      <div className="mb-16">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Technical <span className="text-emerald-500">Research</span>
        </h1>
        <p className="mt-4 max-w-2xl text-slate-400 text-lg">
          Exploring the intersections of cloud infrastructure, proactive security, and autonomous intelligence through data-driven analysis.
        </p>
        
        {/* Research Focus */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
            <div className="text-xs font-mono text-emerald-400 uppercase tracking-widest mb-2">Research Area 1</div>
            <p className="text-sm text-slate-300">Distributed systems design patterns and cloud infrastructure resilience</p>
          </div>
          <div className="p-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
            <div className="text-xs font-mono text-emerald-400 uppercase tracking-widest mb-2">Research Area 2</div>
            <p className="text-sm text-slate-300">Zero-trust security architecture and proactive threat detection</p>
          </div>
          <div className="p-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
            <div className="text-xs font-mono text-emerald-400 uppercase tracking-widest mb-2">Research Area 3</div>
            <p className="text-sm text-slate-300">AI-driven systems and autonomous agent reliability</p>
          </div>
        </div>
      </div>

      <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
        {/* Left Column: Research Feed (Dynamic) */}
        <ResearchFeed initialPapers={researchPapers} />

        {/* Right Column: Sidebar */}
        <ResearchSidebar papers={researchPapers} />
      </div>
    </div>
  );
}
