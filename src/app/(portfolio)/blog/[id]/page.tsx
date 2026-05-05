import { getBroadcastById } from "@/core/domain/portfolio/queries";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, Eye, Share2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/infrastructure/security/headers";
import BroadcastAudioPlayer from "@/presentation/components/shared/BroadcastAudioPlayer";
import NewsletterSubscribe from "@/presentation/components/shared/NewsletterSubscribe";

interface BlogPageProps {
  params: Promise<{ id: string }>;
}

export default async function BlogDetailPage({ params }: BlogPageProps) {
  const { id } = await params;
  const post = await getBroadcastById(id);

  if (!post) {
    notFound();
  }

  return (
    <div className="container mx-auto px-6 py-12 lg:py-20">
      <Link
        href="/blog"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-cyan-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded px-1"
        aria-label="Back to Feed"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Broadcast Feed
      </Link>

      <article className="mx-auto max-w-4xl" aria-labelledby="blog-title">
        <header className="mb-12">
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono mb-6">
            <span className={cn(
              "rounded border px-3 py-1 text-xs font-semibold uppercase tracking-wider",
              post.category === "Security" ? "border-red-500/30 text-red-400 bg-red-500/5" : 
              post.category === "Cloud" ? "border-cyan-500/30 text-cyan-400 bg-cyan-500/5" : 
              "border-emerald-500/30 text-emerald-400 bg-emerald-500/5"
            )}>
              {post.category}
            </span>
            <span className="flex items-center gap-1.5 text-slate-500">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {post.readTime}
            </span>
            <span className="flex items-center gap-1.5 text-slate-500 uppercase">
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
              {post.createdAt}
            </span>
          </div>

          <h1 id="blog-title" className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl leading-tight">
            {post.title}
          </h1>
          
          <div className="mt-8 flex flex-wrap gap-2">
            {post.tags?.map(tag => (
              <span key={tag} className="text-sm font-mono text-cyan-500/60">
                {tag}
              </span>
            ))}
          </div>

          <p className="mt-8 text-xl text-slate-400 leading-relaxed italic border-l-4 border-cyan-500 pl-6">
            {post.excerpt}
          </p>
        </header>

        {/* Engagement Stats Section */}
        <div className="mb-10 flex items-center gap-6 py-4 border-y border-slate-800/50">
          <div className="flex items-center gap-2 text-sm font-mono text-slate-500">
            <Eye className="h-4 w-4 text-cyan-500" />
            <span>{post.engagement?.views || 0} Nodes_Reached</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-mono text-slate-500">
            <Share2 className="h-4 w-4 text-emerald-500" />
            <span>{post.engagement?.shares || 0} Retransmissions</span>
          </div>
        </div>

        {/* Voice AI Readout */}
        <BroadcastAudioPlayer 
          title={post.title}
          text={post.content?.substring(0, 1000) || ""} // Limiting length for synthesis stability
        />

        {/* Visual Media Section (Video) */}
        {post.videoUrl && (
          <div className="mb-12 relative aspect-video overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl" aria-label="Broadcast Video content">
            <iframe
              src={post.videoUrl}
              title={`Video for ${post.title}`}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {/* Visual Media Section (Images) */}
        {post.images && post.images.length > 0 && (
          <div className="mb-12 grid gap-6" aria-label="Broadcast Images">
            {post.images.map((img, idx) => (
              <div key={idx} className="relative aspect-video overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
                <Image
                  src={img}
                  alt={`Illustration ${idx + 1} for ${post.title}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* Content Body */}
        <div className="prose prose-invert prose-cyan max-w-none">
          <div className="text-slate-300 leading-relaxed text-lg whitespace-pre-wrap font-sans">
            {post.content}
          </div>
        </div>

        <footer className="mt-16 border-t border-slate-800 pt-12">
          <NewsletterSubscribe />
        </footer>
      </article>
    </div>
  );
}
