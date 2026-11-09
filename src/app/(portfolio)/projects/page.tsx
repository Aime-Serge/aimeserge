import { getProjects } from "@/core/domain/portfolio/queries";
import Link from "next/link";
import { ExternalLink, FileText, ChevronRight } from "lucide-react";
import CaseStudyMetrics from "@/presentation/components/features/CaseStudyMetrics";
import { SITE, jsonLd as toJsonLd } from "@/config/site";

// Static page, refreshed on admin save (on-demand) or at most daily.
export const revalidate = 86400;

export const metadata = {
  title: "Projects",
  description: "Projects by Aime Serge Ukobizaba: web apps, APIs, AI tools and research. Each page explains the problem, what was built and the result.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `Projects by ${SITE.name}`,
    "description": metadata.description,
    "url": `${SITE.url}/projects`,
    "mainEntity": {
      "@type": "Person",
      "name": SITE.name,
      "jobTitle": "Software Engineer"
    },
    "hasPart": projects.map(project => ({
      "@type": "SoftwareApplication",
      "name": project.title,
      "description": project.tagline || project.summary,
      "url": project.url,
      "applicationCategory": "DeveloperApplication"
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
          Projects
        </h1>
        <p className="mt-4 max-w-2xl text-slate-400 text-lg">
          Things I&apos;ve built and studied. Each case study explains the problem, what I did, the tools I used and the result.
        </p>
      </div>

      <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
        {/* Left Column: Projects Feed */}
        <div className="space-y-8">
          {/* Category Labels */}
          <div className="flex flex-wrap gap-3 pb-4 border-b border-slate-800">
            <div className="text-xs font-mono text-slate-500 uppercase tracking-widest self-center">Featured categories:</div>
            {['AI', 'Cloud', 'Full-Stack'].map((cat) => (
              <span key={cat} className="px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-700/50 bg-slate-900/50 text-slate-400 hover:border-cyan-500/50 hover:text-cyan-400 transition-colors cursor-pointer">
                {cat}
              </span>
            ))}
          </div>

          {projects.length === 0 && (
            <p className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-slate-400">
              Projects are being updated. Please check back soon, or see my code on{" "}
              <a href={SITE.social.github} className="text-cyan-400 hover:text-cyan-300">GitHub</a>.
            </p>
          )}
          {projects.map((project) => (
            <article
              key={project.id}
              className="group relative flex flex-col rounded-2xl border border-slate-800 bg-slate-950 p-1 transition-all hover:border-cyan-500/50"
            >
              <div className="bg-slate-900/40 rounded-xl p-6 md:p-8 backdrop-blur-sm">
                <div className="flex flex-col gap-6">
                  {/* Header Meta */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest">
                        <span className="px-2 py-0.5 rounded border border-cyan-500/30 text-cyan-400 bg-cyan-500/5">
                          {project.category}
                        </span>
                        <span className="text-slate-500">
                          {project.startDate ? `${project.startDate.month} ${project.startDate.year}` : project.createdAt} 
                          {" - "}
                          {project.isCurrent ? "Present" : project.endDate ? `${project.endDate.month} ${project.endDate.year}` : ""}
                        </span>
                      </div>
                      {project.association && (
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tight">
                          Associated with {project.association}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {project.url && (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full p-2 text-slate-400 transition hover:bg-slate-800 hover:text-cyan-400"
                          title="Live Demo"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      {project.pdfUrl && (
                        <a
                          href={project.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full p-2 text-slate-400 transition hover:bg-slate-800 hover:text-emerald-400"
                          title="Documentation"
                        >
                          <FileText className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Project Thumbnail */}
                  {project.images && project.images.length > 0 && (
                    <Link href={`/projects/${project.slug}`}>
                      <div className="relative w-full aspect-video bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700/50 hover:border-cyan-500/30 transition-colors">
                        <img
                          src={project.images[0]}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          width={1280}
                          height={720}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </Link>
                  )}

                  {/* Content */}
                  <div className="space-y-4">
                    <Link href={`/projects/${project.slug}`}>
                      <h2 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors md:text-3xl cursor-pointer">
                        {project.title}
                      </h2>
                    </Link>
                    <p className="max-w-4xl text-slate-400 leading-relaxed text-base md:text-lg">
                      {project.tagline}
                    </p>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {project.tools.map((tool: string) => (
                        <span key={tool} className="text-xs font-mono text-cyan-500/60">
                          #{tool.replace(/\s+/g, '')}
                        </span>
                      ))}
                    </div>

                    {/* Case Study Metrics */}
                    {project.metrics && project.metrics.length > 0 && (
                      <div className="pt-4">
                        <CaseStudyMetrics metrics={project.metrics} />
                      </div>
                    )}
                  </div>

                  {/* Interaction Bar */}
                  <div className="flex items-center justify-between pt-6 border-t border-slate-800/50">
                    <span className="text-xs text-slate-500">{project.role}</span>
                    
                    <Link
                      href={`/projects/${project.slug}`}
                      className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-white hover:text-cyan-400 transition-colors"
                    >
                      Read case study
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* Subtle background glow */}
              <div className="absolute -left-20 -top-20 -z-10 h-64 w-64 rounded-full bg-cyan-500/5 blur-3xl opacity-0 transition-opacity group-hover:opacity-100" />
            </article>
          ))}
        </div>

        {/* Right Column: Sidebar */}
        <aside className="space-y-8">
          
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
             <h2 className="text-sm font-bold text-white mb-6 border-b border-slate-800 pb-2">Tools I use most</h2>
             <div className="flex flex-wrap gap-2">
                {[
                  "TypeScript", "React", "Next.js", "Node.js", "Python",
                  "Django", "PostgreSQL", "GraphQL", "Google Cloud", "Supabase"
                ].map((tech: string) => (
                  <span key={tech} className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-[10px] font-mono text-slate-400 hover:border-cyan-500/50 hover:text-cyan-400 transition-all cursor-pointer">
                    {tech}
                  </span>
                ))}
             </div>

             
             <div className="mt-8 p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                <p className="text-[10px] font-mono text-cyan-500 leading-relaxed uppercase">
                  Code for most projects is public on GitHub. Ask me for a walkthrough of any of them.
                </p>
             </div>
          </div>
        </aside>
      </div>
      </div>
    </>
  );
}
