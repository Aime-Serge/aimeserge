"use client";

import { useState, useMemo } from "react";
import { Microscope, Eye, Download, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { type ResearchPaper } from "@/core/domain/research/types";
import ResearchActionButtons from "@/presentation/components/shared/ResearchActionButtons";

interface ResearchFeedProps {
  initialPapers: ResearchPaper[];
}

export default function ResearchFeed({ initialPapers }: ResearchFeedProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    initialPapers.forEach(paper => paper.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [initialPapers]);

  // Filter papers based on search and tags
  const filteredPapers = useMemo(() => {
    return initialPapers.filter(paper => {
      const matchesSearch = 
        paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paper.abstract.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTags = 
        selectedTags.length === 0 || 
        selectedTags.every(tag => paper.tags.includes(tag));

      return matchesSearch && matchesTags;
    });
  }, [initialPapers, searchQuery, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="space-y-8">
      {/* Search and Filter Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between bg-slate-900/50 p-4 rounded-2xl border border-slate-800 backdrop-blur-sm sticky top-24 z-10">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search research artifacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-2.5 text-sm text-white focus:border-emerald-500 outline-none transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-slate-500 hover:text-white" />
            </button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {allTags.slice(0, 5).map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono transition-all border ${
                selectedTags.includes(tag)
                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                  : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700"
              }`}
            >
              {tag}
            </button>
          ))}
          {selectedTags.length > 0 && (
            <button 
              onClick={() => setSelectedTags([])}
              className="px-3 py-1.5 rounded-lg text-[10px] font-mono text-rose-400 hover:bg-rose-500/10 transition-all"
            >
              CLEAR
            </button>
          )}
        </div>
      </div>

      {/* Papers Feed */}
      <div className="space-y-8">
        <AnimatePresence mode="popLayout">
          {filteredPapers.map((paper) => (
            <motion.article
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={paper.id}
              className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-8 transition-all hover:border-emerald-500/50"
            >
              <div className="flex flex-col gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-mono text-emerald-400">
                      <Microscope className="h-3 w-3" />
                      PUBLISHED: {paper.createdAt}
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500 uppercase">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" /> {paper.views} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Download className="h-3 w-3" /> {paper.downloads} downloads
                      </span>
                    </div>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {paper.title}
                  </h2>
                  <p className="max-w-3xl text-slate-400 leading-relaxed text-sm">
                    {paper.abstract}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {paper.tags.map(tag => (
                      <span key={tag} className={`text-[10px] font-mono ${selectedTags.includes(tag) ? 'text-emerald-400' : 'text-emerald-500/60'}`}>
                        #{tag.replace(/\s+/g, '_')}
                      </span>
                    ))}
                  </div>
                </div>

                <ResearchActionButtons 
                  id={paper.id} 
                  pdfUrl={paper.pdfUrl} 
                  initialDownloads={paper.downloads} 
                  slug={paper.slug}
                />
              </div>

              {/* Background Glow Effect */}
              <div className="absolute -right-20 -top-20 -z-10 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl transition-opacity group-hover:opacity-100" />
            </motion.article>
          ))}
        </AnimatePresence>

        {filteredPapers.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-dashed border-slate-800 p-12 text-center"
          >
            <p className="text-slate-500 font-mono text-sm">
              [!] NO ARTIFACTS MATCHING YOUR SEARCH CRITERIA...
            </p>
            <button 
              onClick={() => { setSearchQuery(""); setSelectedTags([]); }}
              className="mt-4 text-emerald-500 text-xs font-bold uppercase tracking-widest hover:underline"
            >
              Reset Filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
