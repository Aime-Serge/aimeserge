"use client";

import { useState } from "react";
import { FileText, Download, Zap } from "lucide-react";
import { incrementDownloadCount } from "@/core/domain/research/actions";
import Link from "next/link";

interface ResearchActionButtonsProps {
  id: string;
  pdfUrl: string;
  initialDownloads: number;
  slug?: string;
}

export default function ResearchActionButtons({ id, pdfUrl, initialDownloads, slug }: ResearchActionButtonsProps) {
  const [downloads, setDownloads] = useState(initialDownloads);

  const handleAction = async (type: 'view' | 'download') => {
    if (type === 'download') {
      setDownloads(prev => prev + 1);
    }
    await incrementDownloadCount(id);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {slug && (
        <Link
          href={`/research/${slug}`}
          className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-5 py-3 text-sm font-bold text-emerald-400 transition hover:bg-emerald-500/20"
        >
          <Zap className="h-4 w-4" />
          Deep Analysis
        </Link>
      )}
      <a
        href={pdfUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => handleAction('view')}
        className="flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-700"
      >
        <FileText className="h-4 w-4" />
        Read Report
      </a>
      <a
        href={pdfUrl}
        download
        onClick={() => handleAction('download')}
        className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 p-3 text-slate-400 transition hover:bg-slate-800 hover:text-white"
        title={`${downloads} downloads`}
      >
        <Download className="h-4 w-4" />
        <span className="text-[10px] font-mono">{downloads}</span>
      </a>
    </div>
  );
}
