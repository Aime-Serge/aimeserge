"use client";

import React from "react";
import { ContentBlock } from "@/core/domain/portfolio/types";
import Image from "next/image";
import { cn } from "@/infrastructure/security/headers";
import { Info, AlertTriangle, CheckCircle2, PlayCircle } from "lucide-react";

interface ArticleRendererProps {
  blocks: ContentBlock[];
}

export default function ArticleRenderer({ blocks }: ArticleRendererProps) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <div className="prose prose-invert prose-cyan max-w-none space-y-8">
      {blocks.map((block) => {
        switch (block.type) {
          case 'paragraph':
            return (
              <p 
                key={block.id} 
                className="text-lg leading-relaxed text-slate-300"
                dangerouslySetInnerHTML={{ __html: block.data.text || "" }}
              />
            );

          case 'heading':
            const level = block.data.level || 2;
            const HeadingTag = `h${level}` as keyof React.JSX.IntrinsicElements;
            return React.createElement(
              HeadingTag,
              {
                key: block.id,
                className: cn(
                  "font-bold text-white mt-12 mb-6",
                  level === 2 ? "text-3xl" : "text-2xl"
                ),
              },
              block.data.text
            );

          case 'image':
            return (
              <figure key={block.id} className="my-10 space-y-3">
                <div className="relative aspect-video overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
                  {block.data.url && (
                    <Image
                      src={block.data.url}
                      alt={block.data.altText || block.data.caption || "Article illustration"}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                {block.data.caption && (
                  <figcaption className="text-center text-sm text-slate-500 italic">
                    {block.data.caption}
                  </figcaption>
                )}
              </figure>
            );

          case 'video' as any: // Handling video block
            return (
              <figure key={block.id} className="my-10 space-y-3">
                <div className="relative aspect-video overflow-hidden rounded-2xl border border-slate-800 bg-black shadow-2xl">
                   <iframe
                    src={block.data.url}
                    title={block.data.caption || "Video content"}
                    className="absolute inset-0 h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                {block.data.caption && (
                  <figcaption className="text-center text-sm text-slate-500 italic">
                    <PlayCircle className="h-3 w-3 inline mr-2" />
                    {block.data.caption}
                  </figcaption>
                )}
              </figure>
            );

          case 'code':
            return (
              <div key={block.id} className="group relative my-8">
                <div className="absolute -top-3 left-4 rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-400 uppercase tracking-widest border border-slate-700">
                  {block.data.language || 'code'}
                </div>
                <pre className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-6 text-sm font-mono text-cyan-400 shadow-inner">
                  <code>{block.data.code}</code>
                </pre>
              </div>
            );

          case 'callout':
            const CalloutIcon = 
              block.data.type === 'warning' ? AlertTriangle : 
              block.data.type === 'success' ? CheckCircle2 : Info;
            
            return (
              <div 
                key={block.id} 
                className={cn(
                  "flex gap-4 rounded-2xl border p-6 my-8",
                  block.data.type === 'warning' ? "border-amber-500/30 bg-amber-500/5 text-amber-200" :
                  block.data.type === 'success' ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-200" :
                  "border-cyan-500/30 bg-cyan-500/5 text-cyan-200"
                )}
              >
                <CalloutIcon className="h-6 w-6 shrink-0 opacity-80" />
                <p className="text-sm leading-relaxed">{block.data.text}</p>
              </div>
            );

          case 'list':
            return (
              <ul key={block.id} className="list-disc list-inside space-y-3 text-slate-300 my-6">
                {block.data.items?.map((item, idx) => (
                  <li key={idx} dangerouslySetInnerHTML={{ __html: item }} />
                ))}
              </ul>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
