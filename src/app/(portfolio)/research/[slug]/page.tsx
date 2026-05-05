import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronLeft, Microscope, Calendar, Download, Eye, FileText, Share2, User, ExternalLink, Hash, Bookmark, BookOpen, Quote } from "lucide-react";
import Link from "next/link";
import { getPaperBySlug } from "@/core/domain/research/queries";
import ResearchActionButtons from "@/presentation/components/shared/ResearchActionButtons";
import SecurityAudit from "@/presentation/components/features/SecurityAudit";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const paper = await getPaperBySlug(slug);
  if (!paper) return { title: "Research Not Found" };

  return {
    title: `${paper.title} | Technical Research`,
    description: paper.abstract,
  };
}

export default async function ResearchDetailPage({ params }: Props) {
  const { slug } = await params;
  const paper = await getPaperBySlug(slug);

  if (!paper) notFound();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300">
      <div className="container mx-auto px-6 py-12 lg:py-20">
        <Link 
          href="/research"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-400 transition-colors mb-12 font-mono text-sm"
        >
          <ChevronLeft className="h-4 w-4" />
          BACK_TO_ARCHIVE
        </Link>

        <div className="grid gap-12 lg:grid-cols-[1fr_350px]">
          <main className="space-y-16">
            {/* Identity Layer */}
            <section className="space-y-8">
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-mono text-emerald-400 border border-emerald-500/20">
                    <Microscope className="h-3 w-3" />
                    STATUS: PEER_REVIEWED
                  </div>
                  <div className="inline-flex items-center gap-2 text-[10px] font-mono text-slate-500">
                    <Calendar className="h-3 w-3" />
                    PUBLISHED: {paper.publicationDate}
                  </div>
                  {paper.doi && (
                    <div className="inline-flex items-center gap-2 text-[10px] font-mono text-emerald-500/60">
                      <Hash className="h-3 w-3" />
                      DOI: {paper.doi}
                    </div>
                  )}
                </div>

                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-7xl leading-tight">
                  {paper.title}
                </h1>

                {/* Authors Section */}
                <div className="flex flex-wrap gap-6 pt-4">
                  {paper.authors.map((author, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-slate-900/40 border border-slate-800 p-3 rounded-2xl">
                      <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                        <User className="h-5 w-5 text-emerald-500/70" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white leading-tight">{author.name}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] text-slate-500 font-mono">{author.affiliation}</p>
                          {author.orcid && (
                            <Link href={`https://orcid.org/${author.orcid}`} target="_blank" className="text-emerald-500 hover:text-emerald-400">
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interaction Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-mono">Archive_Views</span>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-emerald-500" />
                    <span className="text-xl font-bold text-white font-mono">{paper.views}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-mono">Downloads</span>
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4 text-emerald-500" />
                    <span className="text-xl font-bold text-white font-mono">{paper.downloads}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-mono">Citations</span>
                  <div className="flex items-center gap-2">
                    <Quote className="h-4 w-4 text-emerald-500" />
                    <span className="text-xl font-bold text-white font-mono">{paper.citations}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-mono">Format</span>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs font-bold text-white font-mono">PDF_V1.4</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Abstract Layer */}
            <section className="space-y-6">
              <h3 className="text-emerald-400 font-mono uppercase tracking-widest text-xs flex items-center gap-2">
                <Bookmark className="h-4 w-4" /> 01_Executive_Abstract
              </h3>
              <div className="prose prose-invert max-w-none">
                <p className="text-xl text-slate-300 leading-relaxed font-light italic border-l-2 border-emerald-500/30 pl-8 py-4 bg-slate-900/20 rounded-r-3xl">
                  &quot;{paper.abstract}&quot;
                </p>
              </div>
            </section>

            {/* Structure Layer (IMRaD) */}
            <section className="space-y-12">
              {paper.content.map((section, idx) => (
                <div key={section.id} id={section.id} className="space-y-6 scroll-mt-24">
                  <h3 className="text-emerald-400 font-mono uppercase tracking-widest text-xs flex items-center gap-2">
                    <BookOpen className="h-4 w-4" /> 0{idx + 2}_{section.title}
                  </h3>
                  <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl">
                    <div className="prose prose-invert max-w-none text-slate-400 leading-relaxed text-lg whitespace-pre-wrap font-sans">
                      {section.content}
                    </div>
                  </div>
                </div>
              ))}
            </section>

            {/* Artifact Access */}
            <div className="flex items-center justify-between p-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
              <div className="space-y-1">
                <p className="text-white font-bold">Access Full Research Data</p>
                <p className="text-[10px] text-slate-500 uppercase font-mono">Secured via Supabase Artifact Storage</p>
              </div>
              <ResearchActionButtons 
                id={paper.id} 
                pdfUrl={paper.pdfUrl} 
                initialDownloads={paper.downloads} 
              />
            </div>
          </main>

          <aside className="space-y-8">
            <div className="sticky top-12 space-y-8">
              {/* Table of Contents */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                <h4 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest font-mono mb-6">Archive_Navigation</h4>
                <nav className="space-y-3">
                  {paper.content.map((section) => (
                    <a 
                      key={section.id} 
                      href={`#${section.id}`}
                      className="block text-xs text-slate-500 hover:text-emerald-400 transition-colors border-l border-slate-800 pl-4 py-1 hover:border-emerald-500"
                    >
                      {section.title.toUpperCase()}
                    </a>
                  ))}
                </nav>
              </div>

              {/* Discovery Layer */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                <h4 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest font-mono mb-6">Discovery_Index</h4>
                <div className="space-y-6">
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase font-mono block mb-2">Primary_Category</span>
                    <span className="text-xs text-white bg-slate-800 px-3 py-1 rounded-full border border-slate-700">{paper.category || "General Research"}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase font-mono block mb-2">Language_ISO</span>
                    <span className="text-xs text-white font-mono uppercase">{paper.language}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase font-mono block mb-2">Taxonomic_Keywords</span>
                    <div className="flex flex-wrap gap-2">
                      {paper.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[9px] font-mono text-emerald-500/80">
                          #{tag.replace(/\s+/g, '_')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <SecurityAudit />
              
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                <h4 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest font-mono mb-4">Metadata_Inspector</h4>
                <div className="space-y-4">
                  <div className="flex justify-between text-[9px] font-mono">
                    <span className="text-slate-500">SIGNED_BY</span>
                    <span className="text-white">NODE_ADMIN</span>
                  </div>
                  <div className="flex justify-between text-[9px] font-mono">
                    <span className="text-slate-500">ENCRYPTION</span>
                    <span className="text-white">AES_256_GCM</span>
                  </div>
                  <div className="flex justify-between text-[9px] font-mono">
                    <span className="text-slate-500">CITATION_REQ</span>
                    <span className="text-white uppercase">MANDATORY</span>
                  </div>
                </div>
              </div>

              <button className="w-full group relative overflow-hidden rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-center transition-all hover:bg-emerald-500/10">
                <div className="relative z-10 flex items-center justify-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                  <Share2 className="h-3 w-3" />
                  Broadcast_Analysis
                </div>
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
