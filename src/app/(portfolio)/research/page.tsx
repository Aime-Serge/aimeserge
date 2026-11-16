import { getSiteSettings } from "@/core/domain/portfolio/queries";
import { getResearch } from "@/core/domain/research/queries";
import ResearchFeed from "@/presentation/components/features/ResearchFeed";
import ResearchSidebar from "@/presentation/components/shared/ResearchSidebar";
import { SITE, jsonLd as toJsonLd } from "@/config/site";

// Static page, refreshed on admin save (on-demand) or at most daily.
export const revalidate = 86400;

export async function generateMetadata() {
  const page = (await getSiteSettings()).pages.research;
  return {
    title: "Research",
    description: page.seoDescription,
    alternates: { canonical: "/research" },
    openGraph: { title: page.title, description: page.seoDescription, url: "/research" },
  };
}

export default async function ResearchPage() {
  const settings = await getSiteSettings();
  const page = settings.pages.research;
  const researchPapers = await getResearch();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `Research by ${SITE.name}`,
    "description": page.seoDescription,
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
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">{page.title}</h1>
        <p className="mt-4 max-w-2xl text-slate-400 text-lg">
          {page.intro}
        </p>

        {/* From research to action: the workflow in four plain steps */}
        <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="How my research works">
          {settings.research.steps.map(({ title, body }, i) => (
            <li key={title} className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <p className="text-sm font-semibold text-white"><span className="text-emerald-400">{i + 1}.</span> {title}</p>
              <p className="mt-1 text-sm text-slate-400">{body}</p>
            </li>
          ))}
        </ol>
        
        {/* Research Focus */}
        {settings.research.focus.length > 0 && (
          <>
            <h2 className="mt-12 text-xl font-semibold text-white">{settings.research.focusTitle}</h2>
            <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {settings.research.focus.map((f) => (
                <div key={f.title} className="p-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
                  <div className="text-sm font-semibold text-emerald-400 mb-2">{f.title}</div>
                  <p className="text-sm text-slate-300">{f.body}</p>
                </div>
              ))}
            </div>
          </>
        )}
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
