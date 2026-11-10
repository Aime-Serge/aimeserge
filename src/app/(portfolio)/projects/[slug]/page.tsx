import { getProjectBySlug, getProjects } from "@/core/domain/portfolio/queries";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, FileText, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { isAllowedIframeSrc } from '@/infrastructure/security/sanitizer';

// Pre-render known pages at build; new slugs render on first visit and are cached.
// Admin saves purge them instantly (see infrastructure/cache/content.ts).
export const revalidate = 86400;
export const dynamicParams = true;

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.filter((p) => p.slug).map((p) => ({ slug: p.slug }));
}

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="container mx-auto px-6 py-12 lg:py-20">
      <Link
        href="/projects"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-cyan-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded px-1"
        aria-label="Back to Projects"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Projects
      </Link>

      <div className="grid gap-12 lg:grid-cols-[1fr_350px]">
        {/* Main Content */}
        <article aria-labelledby="project-title">
          <header className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-[10px] font-mono text-cyan-500 border border-cyan-500/30 px-2 py-0.5 rounded bg-cyan-500/5 uppercase tracking-widest">
                {project.category}
              </span>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                {project.startDate ? `${project.startDate.month} ${project.startDate.year}` : project.createdAt}
                {" - "}
                {project.isCurrent ? "Present" : project.endDate ? `${project.endDate.month} ${project.endDate.year}` : ""}
              </span>
            </div>
            <h1 id="project-title" className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
              {project.title}
            </h1>
            {project.association && (
              <p className="mt-2 text-sm text-slate-400 font-medium">
                Associated with <span className="text-white">{project.association}</span>
              </p>
            )}
            <p className="mt-4 text-xl text-cyan-300/90">
              {project.tagline}
            </p>
          </header>

          <div className="space-y-10 text-slate-300">
            {/* Contributors Section */}
            {project.contributors && project.contributors.length > 0 && (
              <section aria-label="Project Contributors">
                <h2 className="text-sm font-semibold text-slate-400 mb-4">Built by</h2>
                <div className="flex flex-wrap gap-3">
                  {project.contributors.map((person: string) => (
                    <div key={person} className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/50 px-4 py-1.5 text-sm font-medium text-slate-300">
                      <div className="h-2 w-2 rounded-full bg-cyan-500" aria-hidden="true" />
                      {person}
                    </div>
                  ))}
                </div>
              </section>
            )}
            {/* Visual Media Section (Video) */}
            {project.videoUrl && (
              <section aria-label="Project Video Demonstration">
                <div className="relative aspect-video overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
                  {isAllowedIframeSrc(project.videoUrl) ? (
                    <iframe
                      src={project.videoUrl}
                      title={`Video for ${project.title}`}
                      className="absolute inset-0 h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      referrerPolicy="no-referrer"
                      sandbox="allow-scripts allow-popups"
                      allowFullScreen
                    />
                  ) : (
                    <div className="p-4 text-sm text-slate-400">
                      <a href={project.videoUrl} target="_blank" rel="noopener noreferrer" className="underline">
                        Open media in new tab
                      </a>
                    </div>
                  )}
                </div>
              </section>
            )}

            <section aria-labelledby="mission-title">
              <h2 id="mission-title" className="mb-4 text-2xl font-bold text-white">The story</h2>
              <div className="leading-relaxed text-lg text-slate-400 whitespace-pre-wrap">
                {project.description}
              </div>
            </section>

            {/* Visual Media Section (Images) */}
            {project.images && project.images.length > 0 && (
              <section aria-label="Project Gallery">
                <h2 className="mb-6 text-2xl font-bold text-white">Screenshots</h2>
                <div className="grid gap-6 sm:grid-cols-2">
                  {project.images.map((img: string, idx: number) => (
                    <div key={idx} className="group relative aspect-video overflow-hidden rounded-xl border border-slate-800 bg-slate-900 transition-all hover:border-cyan-500/50">
                      <Image
                        src={img}
                        alt={`Screenshot ${idx + 1} for ${project.title}`}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-110"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {project.features.length > 0 && (
            <section aria-labelledby="features-title">
              <h2 id="features-title" className="mb-6 text-2xl font-bold text-white">What it does</h2>
              <ul className="grid gap-4 sm:grid-cols-2">
                {project.features.map((feature: string) => (
                  <li key={feature} className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/30 p-4">
                    <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-emerald-500" aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </section>
            )}

            <section aria-labelledby="role-title">
              <h2 id="role-title" className="mb-4 text-2xl font-bold text-white">My role</h2>
              <p className="text-slate-400 bg-slate-900/50 border border-slate-800 rounded-lg p-4 inline-block font-medium">
                {project.role}
              </p>
            </section>
          </div>
        </article>

        {/* Sidebar */}
        <aside className="space-y-8">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm sticky top-24">
            {project.tools.length > 0 && (
            <>
            <h3 className="mb-4 text-sm font-semibold text-white">
              Tools used
            </h3>
            <div className="flex flex-wrap gap-2" aria-label="Tools used">
              {project.tools.map((tool: string) => (
                <span
                  key={tool}
                  className="rounded-md bg-slate-800 px-3 py-1 text-xs font-mono text-cyan-400 border border-slate-700"
                >
                  {tool}
                </span>
              ))}
            </div>
            </>
            )}

            <nav className="mt-8 space-y-3" aria-label="Project Links">
              {project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-cyan-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                >
                  Visit the project
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              )}
              {project.pdfUrl && (
                <a
                  href={project.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                >
                  Read the full write-up (PDF)
                  <FileText className="h-4 w-4" aria-hidden="true" />
                </a>
              )}
            </nav>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
            <h3 className="text-sm font-semibold text-white">Interested in this work?</h3>
            <p className="mt-2 text-sm text-slate-400">I&apos;m open to pilots, partnerships and roles where I can build things like this.</p>
            <Link href="/contact?topic=Partnership%20or%20investment" className="mt-4 inline-flex text-sm font-semibold text-cyan-400 hover:text-cyan-300">
              Get in touch
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
