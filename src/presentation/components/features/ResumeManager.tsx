"use client";

import { useState } from "react";
import { FileText, Upload, CheckCircle2, Loader2, Globe, ExternalLink } from "lucide-react";
import { uploadResume } from "@/domain/portfolio/actions";
import { toast } from "react-hot-toast";

export default function ResumeManager() {
  const [isPending, setIsPending] = useState(false);
  const [lastUrl, setLastUrl] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Invalid format. Please upload a PDF blueprint.");
      return;
    }

    setIsPending(true);
    const result = await uploadResume(file);

    if (result.success && result.url) {
      toast.success("Resume Blueprint Synchronized.");
      setLastUrl(result.url);
    } else {
      const errorMsg = "error" in result ? (result.error as string) : (result as { message?: string }).message;
      toast.error(errorMsg || "System failure during transmission.");
    }
    setIsPending(false);
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 backdrop-blur-md">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-xl bg-cyan-600/20 flex items-center justify-center border border-cyan-500/30">
          <FileText className="h-5 w-5 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white uppercase tracking-tighter">Resume_Asset_Manager</h3>
          <p className="text-[10px] text-slate-500 font-mono">GLOBAL_STORAGE :: SECURE</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Upload Zone */}
        <div className="relative group">
          <input
            type="file"
            onChange={handleFileUpload}
            disabled={isPending}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            accept=".pdf"
          />
          <div className="h-48 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-4 bg-slate-950/50 transition-all group-hover:border-cyan-500/50 group-hover:bg-slate-900/50">
            {isPending ? (
              <Loader2 className="h-10 w-10 text-cyan-500 animate-spin" />
            ) : (
              <Upload className="h-10 w-10 text-slate-600 group-hover:text-cyan-400 transition-colors" />
            )}
            <div className="text-center">
              <p className="text-sm font-bold text-slate-300">Upload New PDF CV</p>
              <p className="text-[10px] text-slate-500 mt-1 uppercase font-mono">DRAG_AND_DROP or CLICK</p>
            </div>
          </div>
        </div>

        {/* Status / Preview */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Transmission_Status</h4>
            
            {lastUrl ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-xs font-bold font-mono">NODE_SYNC_COMPLETE</span>
                </div>
                <a 
                  href={lastUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/30 transition-all group"
                >
                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-cyan-400">VIEW_LIVE_BLUEPRINT</span>
                  <ExternalLink className="h-3 w-3 text-slate-600 group-hover:text-cyan-500" />
                </a>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-slate-600">
                <Globe className="h-5 w-5" />
                <span className="text-xs font-bold font-mono uppercase">Waiting_For_Input...</span>
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl border border-amber-500/10 bg-amber-500/5">
            <p className="text-[10px] text-amber-500/80 leading-relaxed font-mono">
              ⚠️ WARNING: Uploading a new resume will instantly update the public &apos;Download PDF&apos; link on the portfolio. This action is recorded in security audit logs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
