import { getPosts } from "@/core/domain/portfolio/queries";
import Link from "next/link";
import { Clock, Radio, Globe, MessageSquare, Repeat2, Heart, Send, PlayCircle, MoreHorizontal } from "lucide-react";
import { cn } from "@/infrastructure/security/headers";
import { isAllowedIframeSrc } from '@/infrastructure/security/sanitizer';
import NewsletterSubscribe from "@/presentation/components/shared/NewsletterSubscribe";
import Image from "next/image";

export const metadata = {
  title: "Professional Feed | Technical Insights",
  description: "LinkedIn-style professional feed featuring technical posts and long-form articles on Cyber-Cloud Engineering and AI.",
};

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="container mx-auto px-6 py-12 lg:py-20">
      <div className="mb-16">
        <div className="flex items-center gap-2 text-cyan-500 font-mono text-xs uppercase tracking-[0.3em] mb-4">
          <Radio className="h-3.5 w-3.5 animate-pulse" />
          Live_Professional_Feed
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Technical <span className="text-cyan-500">Activity</span>
        </h1>
        <p className="mt-4 max-w-2xl text-slate-400 text-lg">
          Insights on production logs, architectural breakthroughs, and professional milestones.
        </p>
      </div>

      <div className="mx-auto max-w-2xl space-y-8">
        {posts.map((post) => (
          <article
            key={post.id}
            className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 shadow-xl backdrop-blur-sm transition hover:border-slate-700"
          >
            {/* Post Header */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                  <span className="text-xs font-bold text-cyan-500">AS</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">Aime Serge UKOBIZABA</h3>
                    <span className="text-[10px] text-slate-500">• 1st</span>
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-1">Senior Software Engineer | Cybersecurity & Cloud Architect</p>
                  <div className="flex items-center gap-1 text-[9px] text-slate-600 uppercase font-mono">
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <Globe className="h-2 w-2" />
                  </div>
                </div>
              </div>
              <button className="text-slate-500 hover:text-white transition">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>

            {/* Post Content */}
            <div className="px-4 pb-4">
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                {post.textContent}
              </p>
              
              {post.hashtags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {post.hashtags.map(tag => (
                    <span key={tag} className="text-xs font-bold text-cyan-500 hover:underline cursor-pointer">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* CASE 1: Article Preview Card */}
            {post.articleId && post.article && (
              <Link 
                href={`/blog/${post.article.slug}`}
                className="block mx-4 mb-4 overflow-hidden rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-800 transition group"
              >
                {post.article.coverImageUrl && (
                  <div className="relative aspect-[16/9] w-full">
                    <Image 
                      src={post.article.coverImageUrl} 
                      alt={post.article.coverImageAlt || post.article.title}
                      fill
                      className="object-cover transition group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-4">
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Article</p>
                  <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition mb-2">
                    {post.article.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {post.article.excerpt}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-500 uppercase font-mono">
                    <Clock className="h-3 w-3" />
                    <span>{post.article.estimatedReadTime} min read</span>
                  </div>
                </div>
              </Link>
            )}

            {/* CASE 2: Video Post Payload */}
            {post.mediaType === 'VIDEO' && post.mediaPayload.videoUrl && (
              <div className="relative aspect-video w-full border-y border-slate-800 bg-black">
                {isAllowedIframeSrc(post.mediaPayload.videoUrl) ? (
                  <iframe
                    src={post.mediaPayload.videoUrl}
                    title="Post video content"
                    className="absolute inset-0 h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    referrerPolicy="no-referrer"
                    sandbox="allow-scripts allow-popups"
                    allowFullScreen
                  />
                ) : (
                  <div className="p-4 text-sm text-slate-400">
                    <a href={post.mediaPayload.videoUrl} target="_blank" rel="noopener noreferrer" className="underline">
                      Open media in new tab
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* CASE 3: Standard Image Payload (Single or Carousel) */}
            {post.mediaType === 'IMAGE' && post.mediaPayload.images?.[0] && !post.articleId && (
              <div className="relative aspect-square w-full border-y border-slate-800 bg-black">
                <Image 
                  src={post.mediaPayload.images[0]} 
                  alt="Post media"
                  fill
                  className="object-contain"
                />
              </div>
            )}

            {post.mediaType === 'IMAGE_CAROUSEL' && post.mediaPayload.images && post.mediaPayload.images.length > 0 && (
              <div className={cn(
                "grid gap-1 border-y border-slate-800 bg-slate-900",
                post.mediaPayload.images.length === 1 ? "grid-cols-1" : "grid-cols-2"
              )}>
                {post.mediaPayload.images.slice(0, 4).map((img, idx) => (
                  <div key={idx} className={cn(
                    "relative bg-black overflow-hidden",
                    post.mediaPayload.images!.length === 3 && idx === 0 ? "row-span-2 aspect-auto" : "aspect-square"
                  )}>
                    <Image 
                      src={img} 
                      alt={`Post media ${idx + 1}`}
                      fill
                      className="object-cover hover:scale-105 transition duration-500"
                    />
                    {idx === 3 && post.mediaPayload.images!.length > 4 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                        <span className="text-white font-bold text-xl">+{post.mediaPayload.images!.length - 4}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Engagement Stats */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-slate-800/50">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                  <div className="flex -space-x-1">
                    <div className="h-3.5 w-3.5 rounded-full bg-cyan-500 flex items-center justify-center border border-slate-900">
                       <Heart className="h-2 w-2 text-white fill-white" />
                    </div>
                  </div>
                  <span>{post.engagement.likes}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-slate-500">
                <span>{post.engagement.shares} shares</span>
                <span>•</span>
                <span>{post.engagement.views} views</span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center border-t border-slate-800/50">
               <button className="flex flex-1 items-center justify-center gap-2 py-3 text-xs font-bold text-slate-400 hover:bg-slate-800 transition">
                  <Heart className="h-4 w-4" /> Like
               </button>
               <button className="flex flex-1 items-center justify-center gap-2 py-3 text-xs font-bold text-slate-400 hover:bg-slate-800 transition">
                  <MessageSquare className="h-4 w-4" /> Comment
               </button>
               <button className="flex flex-1 items-center justify-center gap-2 py-3 text-xs font-bold text-slate-400 hover:bg-slate-800 transition">
                  <Repeat2 className="h-4 w-4" /> Repost
               </button>
               <button className="flex flex-1 items-center justify-center gap-2 py-3 text-xs font-bold text-slate-400 hover:bg-slate-800 transition">
                  <Send className="h-4 w-4" /> Send
               </button>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-20 border-t border-slate-800 pt-12 text-center">
        <NewsletterSubscribe />
      </div>
    </div>
  );
}
