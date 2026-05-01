"use client";

import { cn } from "@/infrastructure/security/headers";
import type { SearchResult } from "@/types/search";
import { Loader2, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

interface GlobalSearchProps {
  className?: string;
  placeholder?: string;
  onNavigate?: () => void;
}

function getResultTypeLabel(type: SearchResult["type"]): string {
  if (type === "project") return "Project";
  if (type === "research") return "Research";
  return "Broadcast";
}

function trimSnippet(snippet: string, maxLength = 120): string {
  if (snippet.length <= maxLength) {
    return snippet;
  }
  return `${snippet.slice(0, maxLength).trim()}...`;
}

export default function GlobalSearch({
  className,
  placeholder = "Search projects, research, broadcasts...",
  onNavigate,
}: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRequestRef = useRef<AbortController | null>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      activeRequestRef.current?.abort();
      const controller = new AbortController();
      activeRequestRef.current = controller;

      setIsLoading(true);
      try {
        const response = await fetch(`/api/v1/search?q=${encodeURIComponent(normalizedQuery)}&limit=8`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          setResults([]);
          return;
        }

        const payload: { results?: SearchResult[] } = await response.json();
        setResults(payload.results || []);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setResults([]);
        }
      } finally {
        setIsLoading(false);
      }
    }, 220);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const shouldShowDropdown = isOpen && query.trim().length >= 2;
  const hasNoResults = shouldShowDropdown && !isLoading && results.length === 0;
  const resultSummary = useMemo(() => {
    if (results.length === 0) {
      return "";
    }
    return `${results.length} result${results.length === 1 ? "" : "s"}`;
  }, [results]);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative flex items-center">
        <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate-500" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-800 bg-slate-900/60 py-2 pl-9 pr-9 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          aria-label="Search portfolio content"
        />
        {isLoading ? (
          <Loader2 className="absolute right-3 h-4 w-4 animate-spin text-cyan-400" />
        ) : (
          <Sparkles className="absolute right-3 h-4 w-4 text-slate-600" />
        )}
      </div>

      {shouldShowDropdown && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[420px] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/95 p-2 shadow-2xl backdrop-blur-md">
          {resultSummary && (
            <p className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-slate-500">
              {resultSummary}
            </p>
          )}

          {results.map((result) => (
            <Link
              key={`${result.type}-${result.id}`}
              href={result.href}
              onClick={() => {
                setIsOpen(false);
                setQuery("");
                onNavigate?.();
              }}
              className="block rounded-xl border border-transparent p-3 transition hover:border-cyan-500/30 hover:bg-slate-900"
            >
              <div className="mb-1 flex items-center justify-between gap-3">
                <h4 className="text-sm font-semibold text-white">{result.title}</h4>
                <span className="rounded border border-cyan-500/20 bg-cyan-500/5 px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest text-cyan-400">
                  {getResultTypeLabel(result.type)}
                </span>
              </div>
              <p className="text-xs text-slate-400">{trimSnippet(result.snippet)}</p>
              {result.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {result.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="text-[10px] font-mono text-slate-500">
                      #{tag.replace(/\s+/g, "")}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}

          {hasNoResults && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-center">
              <p className="text-xs text-slate-400">No indexed content matched your query.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

