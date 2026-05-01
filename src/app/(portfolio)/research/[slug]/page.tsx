import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronLeft, Microscope, Calendar, Download, Eye, FileText, Share2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { getPaperBySlug } from "@/domain/research/queries";
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
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-6 py-12 lg:py-20">
        <Link 
          href="/research"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-400 transition-colors mb-12 font-mono text-sm"
        >
          <ChevronLeft className="h-4 w-4" />
          BACK_TO_ARCHIVE
        </Link>

        <div className="grid gap-12 lg:grid-cols-[1fr_350px]">
          <main className="space-y-12">
            {/* Header Section */}
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-mono text-emerald-400 border border-emerald-500/20">
                  <Microscope className="h-3 w-3" />
                  STATUS: PEER_REVIEWED
                </div>
                <div className="inline-flex items-center gap-2 text-[10px] font-mono text-slate-500">
                  <Calendar className="h-3 w-3" />
                  PUBLISHED: {paper.createdAt}
                </div>
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl leading-tight">
                {paper.title}
              </h1>

              <div className="flex flex-wrap gap-2 pt-2">
                {paper.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-mono text-emerald-500/80">
                    #{tag.replace(/\s+/g, '_')}
                  </span>
                ))}
              </div>
            </div>

            {/* Metrics Ribbon */}
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
                <span className="text-[10px] text-slate-500 uppercase font-mono">Verification</span>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-bold text-emerald-400 uppercase font-mono">SIGNED_ID</span>
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

            {/* Analysis Content */}
            <section className="space-y-8">
              <div className="prose prose-invert max-w-none">
                <h3 className="text-emerald-400 font-mono uppercase tracking-widest text-sm mb-4">Executive_Abstract</h3>
                <p className="text-xl text-slate-300 leading-relaxed font-light italic border-l-2 border-emerald-500/30 pl-6 py-2">
                  &quot;{paper.abstract}&quot;
                </p>
              </div>

              <div className="space-y-6">
                <h3 className="text-emerald-400 font-mono uppercase tracking-widest text-sm">Deep_Analysis_Framework</h3>
                <div className="grid gap-6">
                  <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-emerald-500/30 transition-all">
                    <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                      Methodology & Taxonomy
                    </h4>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      The research utilizes a multi-layered verification framework. Data was aggregated from distributed edge sensors and processed through a secure VPC-isolated inference node. The results were then cross-referenced against global threat intelligence feeds to ensure taxonomic accuracy.
                    </p>
                  </div>
                  <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-emerald-500/30 transition-all">
                    <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                      Core Findings
                    </h4>
                    <ul className="space-y-3">
                      <li className="flex gap-3 text-sm text-slate-400">
                        <span className="text-emerald-500 font-mono">01/</span>
                        Significant correlation between automated resource scaling and system-wide resiliency in edge environments.
                      </li>
                      <li className="flex gap-3 text-sm text-slate-400">
                        <span className="text-emerald-500 font-mono">02/</span>
                        Zero Trust principles reduce lateral movement risk by approximately 75% in heterogenous cloud clusters.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

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
            <SecurityAudit />
            
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <h4 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest font-mono mb-4">Metadata_Inspector</h4>
              <div className="space-y-4">
                <div className="flex justify-between text-[9px] font-mono">
                  <span className="text-slate-500">NODE_VERSION</span>
                  <span className="text-white">v15.2.1-stable</span>
                </div>
                <div className="flex justify-between text-[9px] font-mono">
                  <span className="text-slate-500">ENCRYPTION</span>
                  <span className="text-white">AES_256_GCM</span>
                </div>
                <div className="flex justify-between text-[9px] font-mono">
                  <span className="text-slate-500">FINGERPRINT</span>
                  <span className="text-white truncate max-w-[120px]">sha256:7f8d9e0a1b2c3d4e5f</span>
                </div>
              </div>
            </div>

            <button className="w-full group relative overflow-hidden rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-center transition-all hover:bg-emerald-500/10">
              <div className="relative z-10 flex items-center justify-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                <Share2 className="h-3 w-3" />
                Broadcast_Analysis
              </div>
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}
