import { getBroadcasts } from "@/core/domain/portfolio/queries";
import Link from "next/link";
import { Clock, ArrowRight, Eye, Share2, Radio, Globe } from "lucide-react";
import { cn } from "@/infrastructure/security/headers";
import NewsletterSubscribe from "@/presentation/components/shared/NewsletterSubscribe";

export const metadata = {
  title: "Broadcast Feed | Technical Updates",
  description: "Real-time technical broadcasts on Cyber-Cloud Engineering, AI deployments, and ALX milestones.",
};

export default async function BlogPage() {
  const broadcasts = await getBroadcasts();

  return (
    <div className="container mx-auto px-6 py-12 lg:py-20">
      <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-500 font-mono text-xs uppercase tracking-[0.3em] mb-4">
            <Radio className="h-3.5 w-3.5 animate-pulse" />
            Live_Broadcast_Feed
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Technical <span className="text-cyan-500">Node</span> Activity
          </h1>
          <p className="mt-4 max-w-2xl text-slate-400 text-lg">
            A real-time broadcast of production logs, architectural breakthroughs, and professional milestones.
          </p>
        </div>
        
        <div className="hidden lg:flex items-center gap-4 px-4 py-2 rounded-full border border-slate-800 bg-slate-900/50">
           <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-6 w-6 rounded-full border-2 border-slate-900 bg-slate-800" />
              ))}
           </div>
           <span className="text-[10px] font-mono text-slate-500 uppercase">1.2k Subscribed Nodes</span>
        </div>
      </div>

      <div className="grid gap-8">
        {broadcasts.map((post) => (
          <article
            key={post.id}
            className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-1 transition-all hover:border-cyan-500/50"
          >
            <div className="bg-slate-900/40 rounded-xl p-6 md:p-8 backdrop-blur-sm">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1 space-y-4">
                  {/* Meta Node */}
                  <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono uppercase tracking-widest">
                    <span className={cn(
                      "px-2 py-0.5 rounded border",
                      post.category === "Security" ? "border-red-500/30 text-red-400 bg-red-500/5" : 
                      post.category === "Cloud" ? "border-cyan-500/30 text-cyan-400 bg-cyan-500/5" : 
                      "border-emerald-500/30 text-emerald-400 bg-emerald-500/5"
                    )}>
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </span>
                    <span className="text-slate-700 hidden sm:inline">|</span>
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Globe className="h-3 w-3" />
                      {post.createdAt}
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors md:text-3xl">
                    {post.title}
                  </h2>
                  
                  <p className="max-w-4xl text-slate-400 leading-relaxed text-base md:text-lg">
                    {post.excerpt}
                  </p>

                  {/* Tags Social Style */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {post.tags?.map(tag => (
                      <span key={tag} className="text-xs font-mono text-cyan-500/60 hover:text-cyan-400 transition-colors cursor-pointer">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Engagement Bar */}
                  <div className="flex items-center gap-6 pt-4 border-t border-slate-800/50">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                      <Eye className="h-3.5 w-3.5" />
                      {post.engagement?.views || 0}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                      <Share2 className="h-3.5 w-3.5" />
                      {post.engagement?.shares || 0}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between md:min-w-[120px]">
                   <Link
                    href={`/blog/${post.id}`}
                    className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 transition-all hover:border-cyan-500 hover:bg-cyan-600 hover:text-white group-hover:shadow-[0_0_15px_rgba(8,145,178,0.3)]"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <div className="hidden md:block text-right">
                    <span className="text-[8px] font-mono text-slate-700 block uppercase">Encryption</span>
                    <span className="text-[10px] font-mono text-emerald-500 uppercase">Verified</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Subtle background glow */}
            <div className="absolute -left-20 -top-20 -z-10 h-64 w-64 rounded-full bg-cyan-500/5 blur-3xl opacity-0 transition-opacity group-hover:opacity-100" />
          </article>
        ))}
      </div>

      <div className="mt-20 border-t border-slate-800 pt-12 text-center">
        <NewsletterSubscribe />
      </div>
    </div>
  );
}
