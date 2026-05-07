"use client";

import { useState } from "react";
import { Brain, Send, Cpu, Trash2, Github, Linkedin, Twitter, Globe } from "lucide-react";
import { upsertKnowledge } from "@/core/domain/ai/mutations";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { cn } from "@/infrastructure/security/headers";

type SocialSource = "LinkedIn" | "X (Twitter)" | "GitHub" | "Other";

export default function ManualSyncTool() {
  const [isPending, setIsPending] = useState(false);
  const [source, setSocialSource] = useState<SocialSource>("LinkedIn");
  const [content, setContent] = useState("");

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsPending(true);
    const id = `manual-sync-${Date.now()}`;
    
    const result = await upsertKnowledge({
      id,
      content: `[Manual Sync: ${source}] ${content}`,
      metadata: {
        type: 'social',
        platform: source.toLowerCase(),
        date: new Date().toISOString(),
        isManual: true
      }
    });

    if (result.success) {
      toast.success(`${source} update absorbed by Digital Twin.`);
      setContent("");
    } else {
      toast.error("Handshake failed. Sync rejected.");
    }
    setIsPending(false);
  };

  const getSourceIcon = (s: SocialSource) => {
    switch (s) {
      case "GitHub": return <Github className="h-4 w-4" />;
      case "LinkedIn": return <Linkedin className="h-4 w-4" />;
      case "X (Twitter)": return <Twitter className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-3 uppercase tracking-tighter">
            <Brain className="h-6 w-6 text-cyan-500" />
            AI_Knowledge_Injection
          </h3>
          <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest font-mono">Manually train your Digital Twin with latest updates</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-500 bg-cyan-500/5 px-3 py-1 rounded-full border border-cyan-500/20">
          <Cpu className="h-3 w-3" />
          RAG_NODE_ACTIVE
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <form onSubmit={handleSync} className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 backdrop-blur-md space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Update_Source</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(["LinkedIn", "X (Twitter)", "GitHub", "Other"] as SocialSource[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSocialSource(s)}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2.5 rounded-xl border text-[10px] font-bold uppercase transition-all",
                    source === s 
                      ? "bg-cyan-600 border-cyan-500 text-white shadow-lg shadow-cyan-600/20" 
                      : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700"
                  )}
                >
                  {getSourceIcon(s)}
                  {s.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Payload_Content</label>
            <textarea
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Paste your latest ${source} post here...`}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 text-sm text-slate-300 min-h-[250px] focus:border-cyan-500 outline-none transition-all font-sans"
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <p className="text-[10px] text-slate-600 uppercase font-mono max-w-[200px]">
              Note: This content will be vectorized and stored in the pgvector vault instantly.
            </p>
            <button
              disabled={isPending || !content.trim()}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-3 text-xs"
            >
              {isPending ? <Cpu className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              INJECT_KNOWLEDGE
            </button>
          </div>
        </form>

        <aside className="space-y-6">
          <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-md">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Node_Statistics</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400">Total Vectors</span>
                <span className="text-xs font-bold text-white">1,284</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400">Social Syncs</span>
                <span className="text-xs font-bold text-white">42</span>
              </div>
              <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full w-[65%] bg-cyan-500" />
              </div>
              <p className="text-[9px] text-slate-600 leading-relaxed italic">
                &quot;Knowledge density is optimal. The Twin is grounded in your professional evolution.&quot;
              </p>
            </div>
          </div>

          <div className="p-6 rounded-3xl border border-red-500/10 bg-red-500/5 backdrop-blur-md">
            <h4 className="text-[10px] font-bold text-red-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <Trash2 className="h-3 w-3" /> Danger_Zone
            </h4>
            <button 
              onClick={() => confirm("Purge all manual sync nodes? This will reset the AI's recent memory.")}
              className="w-full py-2.5 rounded-xl border border-red-500/20 text-red-400 text-[10px] font-bold uppercase hover:bg-red-500 hover:text-white transition-all"
            >
              PURGE_MANUAL_NODES
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
