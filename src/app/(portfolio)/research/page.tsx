import { getResearch } from "@/core/domain/research/queries";
import ResearchFeed from "@/presentation/components/features/ResearchFeed";
import ResearchSidebar from "@/presentation/components/shared/ResearchSidebar";
import { SITE, jsonLd as toJsonLd } from "@/config/site";

// Static page, refreshed on admin save (on-demand) or at most daily.
export const revalidate = 86400;

export const metadata = {
  title: "Research",
  description: "Independent research by Aime Serge Ukobizaba on climate data, urban transport, security and AI, with plain-language summaries and downloadable papers.",
  alternates: { canonical: "/research" },
};

export default async function ResearchPage() {
  const researchPapers = await getResearch();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `Research by ${SITE.name}`,
    "description": metadata.description,
    "url": `${SITE.url}/research`,
    "mainEntity": {
      "@type": "Person",
      "name": SITE.name,
      "jobTitle": "Software Engineer",
      "url": SITE.url
    },
    "hasPart": researchPapers.map(paper => ({
      "@type": "ScholarlyArticle",
      "headline": paper.title,
      "description": paper.abstract || paper.title,
      "datePublished": paper.publicationDate,
      "author": { "@type": "Person", "name": SITE.name },
      "citation": paper.citations || 0
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(jsonLd) }}
      />
      <div className="container mx-auto px-6 py-12 lg:py-20">
      <div className="mb-16">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Research
        </h1>
        <p className="mt-4 max-w-2xl text-slate-400 text-lg">
          Independent studies where I collect data, analyse it and share what I found. Each paper starts with a short summary anyone can read.
        </p>
        
        {/* Research Focus */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
            <div className="text-xs font-mono text-emerald-400 uppercase tracking-widest mb-2">Climate & environment</div>
            <p className="text-sm text-slate-300">Using public climate data to show local trends that help planning in East Africa.</p>
          </div>
          <div className="p-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
            <div className="text-xs font-mono text-emerald-400 uppercase tracking-widest mb-2">Security</div>
            <p className="text-sm text-slate-300">How to spot and stop attacks early, and design systems that are safe by default.</p>
          </div>
          <div className="p-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
            <div className="text-xs font-mono text-emerald-400 uppercase tracking-widest mb-2">AI you can trust</div>
            <p className="text-sm text-slate-300">Making AI assistants and agents accurate, grounded in real sources and safe to use.</p>
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
    </>
  );
}
