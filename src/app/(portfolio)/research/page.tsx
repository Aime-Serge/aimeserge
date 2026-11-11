import { getResearch } from "@/core/domain/research/queries";
import ResearchFeed from "@/presentation/components/features/ResearchFeed";
import ResearchSidebar from "@/presentation/components/shared/ResearchSidebar";
import { SITE, jsonLd as toJsonLd } from "@/config/site";

// Static page, refreshed on admin save (on-demand) or at most daily.
export const revalidate = 86400;

export const metadata = {
  title: "Research",
  description: "Research for impact by Aime Serge Ukobizaba: studies of the risks facing communities, people and organisations in climate, health, small business, transport and digital safety, with plain-language summaries.",
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
          Research for impact
        </h1>
        <p className="mt-4 max-w-2xl text-slate-400 text-lg">
          I study the risks that affect communities, individuals and organisations, measure how big they are, and look for practical ways to reduce them. Each paper starts with a short summary anyone can read.
        </p>

        {/* From research to action: the workflow in four plain steps */}
        <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="How my research works">
          {[
            ["Spot the risk", "Who is affected, and what could go wrong for them?"],
            ["Gather the data", "Public records, conversations with the people affected, and open datasets."],
            ["Explain the findings", "Plain-language results that leaders and the public can use."],
            ["Turn it into action", "A tool, a product or advice that lowers the risk."],
          ].map(([title, body], i) => (
            <li key={title} className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <p className="text-sm font-semibold text-white"><span className="text-emerald-400">{i + 1}.</span> {title}</p>
              <p className="mt-1 text-sm text-slate-400">{body}</p>
            </li>
          ))}
        </ol>
        
        {/* Research Focus */}
        <h2 className="mt-12 text-xl font-semibold text-white">What I research</h2>
        <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
            <div className="text-sm font-semibold text-emerald-400 mb-2">Climate risk for communities</div>
            <p className="text-sm text-slate-300">How rising heat and less predictable rain affect farming and water in East Africa, using 26 years of public data.</p>
          </div>
          <div className="p-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
            <div className="text-sm font-semibold text-emerald-400 mb-2">Health access</div>
            <p className="text-sm text-slate-300">Where clinics lose time and information, and how one connected system with an assistant can help care teams (INEZA AI).</p>
          </div>
          <div className="p-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
            <div className="text-sm font-semibold text-emerald-400 mb-2">Small business and finance</div>
            <p className="text-sm text-slate-300">How small shops keep records, and how clearer records can lower costs and make lending safer (DukaAI).</p>
          </div>
          <div className="p-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
            <div className="text-sm font-semibold text-emerald-400 mb-2">Digital safety and trustworthy AI</div>
            <p className="text-sm text-slate-300">How people and organisations get attacked online, and how to build systems and AI assistants that are safe and accurate by default.</p>
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
