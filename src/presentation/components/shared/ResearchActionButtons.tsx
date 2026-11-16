"use client";

import { useState } from "react";
import { FileText, Download, BookOpen, Mail } from "lucide-react";
import { incrementDownloadCount } from "@/core/domain/research/mutations";
import Link from "next/link";

interface ResearchActionButtonsProps {
  id: string;
  pdfUrl: string;
  initialDownloads: number;
  slug?: string;
}

/** Read the summary, open or download the PDF, or (no PDF yet) ask for the manuscript. */
export default function ResearchActionButtons({ id, pdfUrl, initialDownloads, slug }: ResearchActionButtonsProps) {
  const [downloads, setDownloads] = useState(initialDownloads);
  const hasPdf = Boolean(pdfUrl && pdfUrl.trim());

  const handleAction = async (type: "view" | "download") => {
    if (type === "download") setDownloads((prev) => prev + 1);
    await incrementDownloadCount(id);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {slug && (
        <Link
          href={`/research/${slug}`}
          className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-3 text-sm font-bold text-emerald-400 transition hover:bg-emerald-500/20"
        >
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          Read the summary
        </Link>
      )}
      {hasPdf ? (
        <>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleAction("view")}
            className="flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-700"
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            Read the full paper
          </a>
          <a
            href={pdfUrl}
            download
            onClick={() => handleAction("download")}
            aria-label={`Download PDF (${downloads} downloads)`}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 p-3 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            title={`${downloads} downloads`}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            {downloads > 0 && <span className="text-[10px] font-mono">{downloads}</span>}
          </a>
        </>
      ) : (
        <Link
          href="/contact?topic=Research%20collaboration"
          className="flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-700"
        >
          <Mail className="h-4 w-4" aria-hidden="true" />
          Ask for the full manuscript
        </Link>
      )}
    </div>
  );
}
