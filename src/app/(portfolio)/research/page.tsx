import { getResearch } from "@/core/domain/research/queries";
import ResearchFeed from "@/presentation/components/features/ResearchFeed";
import ResearchSidebar from "@/presentation/components/shared/ResearchSidebar";

export const metadata = {
  title: "Technical Research | Aime Serge",
  description: "Exploring the intersections of cloud infrastructure, proactive security, and autonomous intelligence.",
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
