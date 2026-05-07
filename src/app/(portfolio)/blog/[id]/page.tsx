import { getArticleBySlug } from "@/core/domain/portfolio/queries";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, Eye, Share2, Globe } from "lucide-react";
import Image from "next/image";
import { cn } from "@/infrastructure/security/headers";
import ArticleRenderer from "@/presentation/components/shared/ArticleRenderer";
import NewsletterSubscribe from "@/presentation/components/shared/NewsletterSubscribe";
import type { Metadata } from 'next';

interface ArticlePageProps {
  params: Promise<{ id: string }>; // This 'id' will be treated as the 'slug'
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { id: slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) return { title: "Article Not Found" };

  return {
    title: `${article.title} | Technical Article`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      images: article.coverImageUrl ? [{ url: article.coverImageUrl }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
    }
  };
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { id: slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="container mx-auto px-6 py-12 lg:py-20">
      <Link
        href="/blog"
        className="mb-12 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-cyan-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Professional Feed
      </Link>

      <article className="mx-auto max-w-4xl">
        <header className="mb-12 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[10px] font-mono uppercase tracking-[0.2em] mb-6 text-cyan-500">
             <span className="px-2 py-0.5 border border-cyan-500/30 bg-cyan-500/5 rounded">Article</span>
             <span>•</span>
             <span className="flex items-center gap-1.5">
                <Clock className="h-3 w-3" /> {article.estimatedReadTime} min read
             </span>
             <span>•</span>
             <span className="flex items-center gap-1.5">
                <Globe className="h-3 w-3" /> {new Date(article.createdAt).toLocaleDateString()}
             </span>
          </div>

          <h1 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl leading-tight mb-8">
            {article.title}
          </h1>

          <div className="flex items-center justify-center md:justify-start gap-4 mb-10">
             <div className="h-12 w-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                <span className="text-sm font-bold text-cyan-500">AS</span>
             </div>
             <div className="text-left">
                <p className="text-sm font-bold text-white">Aime Serge UKOBIZABA</p>
                <p className="text-xs text-slate-500">Senior Software Engineer | Cybersecurity Specialist</p>
             </div>
          </div>

          {article.coverImageUrl && (
            <div className="relative aspect-[21/9] w-full overflow-hidden rounded-3xl border border-slate-800 shadow-2xl mb-12">
              <Image
                src={article.coverImageUrl}
                alt={article.coverImageAlt || article.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <p className="text-xl text-slate-400 leading-relaxed italic border-l-4 border-cyan-500 pl-6 max-w-3xl mx-auto md:mx-0">
            {article.excerpt}
          </p>
        </header>

        {/* Engagement Stats Section */}
        <div className="mb-12 flex items-center gap-6 py-4 border-y border-slate-800/50">
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase">
            <Eye className="h-4 w-4 text-cyan-500" />
            <span>1.2k Nodes_Reached</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase">
            <Share2 className="h-4 w-4 text-emerald-500" />
            <span>45 Retransmissions</span>
          </div>
        </div>

        {/* Main Content Body */}
        <ArticleRenderer blocks={article.bodyContent} />

        <footer className="mt-20 border-t border-slate-800 pt-16">
          <div className="rounded-3xl bg-slate-900/40 p-8 md:p-12 border border-slate-800 backdrop-blur-sm text-center">
             <h3 className="text-2xl font-bold text-white mb-4">Did you find this architectural insight useful?</h3>
             <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                Join 1,200+ engineers receiving my weekly broadcasts on secure cloud deployments and AI systems.
             </p>
             <NewsletterSubscribe />
          </div>
          <div className="mt-12 text-center text-[10px] font-mono text-slate-600 uppercase tracking-[0.5em]">
             End of Transmission // Node Verified
          </div>
        </footer>
      </article>
    </div>
  );
}
