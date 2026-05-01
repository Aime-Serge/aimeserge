"use client";

import { Activity } from "lucide-react";
import SecurityAudit from "@/presentation/components/features/SecurityAudit";
import { type ResearchPaper } from "@/domain/research/types";

interface ResearchSidebarProps {
  papers: ResearchPaper[];
}

export default function ResearchSidebar({ papers }: ResearchSidebarProps) {
  // Dynamically calculate clusters from tags
  const clusters = papers.reduce((acc: Record<string, number>, paper) => {
    paper.tags.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {});

  const sortedClusters = Object.entries(clusters)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const totalDownloads = papers.reduce((acc, p) => acc + (p.downloads || 0), 0);
  const totalViews = papers.reduce((acc, p) => acc + (p.views || 0), 0);
  const impactFactor = papers.length > 0 ? ((totalDownloads * 2 + totalViews) / papers.length / 10).toFixed(1) : "0.0";

  return (
    <aside className="space-y-8">
      <SecurityAudit />
      
      <div className="rounded-2xl border border-slate-800 bg-emerald-500/5 p-6 backdrop-blur-sm">
         <h4 className="text-sm font-bold text-emerald-500 uppercase tracking-widest font-mono mb-6 border-b border-emerald-500/20 pb-2">Research Clusters</h4>
         
         {sortedClusters.length > 0 ? (
           <ul className="space-y-4">
              {sortedClusters.map(([name, count]) => (
                <li key={name} className="flex items-center justify-between text-xs group cursor-pointer">
                  <div className="flex items-center gap-2 text-slate-400 group-hover:text-emerald-400 transition-colors">
                    <span className="h-1 w-1 bg-emerald-500 rounded-full" />
                    {name}
                  </div>
                  <span className="font-mono text-slate-600 group-hover:text-emerald-500">({count})</span>
                </li>
              ))}
           </ul>
         ) : (
           <p className="text-[10px] text-slate-600 font-mono italic uppercase">No clusters indexed yet...</p>
         )}

         <button className="w-full mt-8 rounded-xl border border-emerald-500/30 bg-emerald-500/5 py-3 text-[10px] font-bold text-emerald-500 uppercase tracking-widest hover:bg-emerald-500/10 transition-all">
            Request Full Archive
         </button>
      </div>

      {/* Real-time Telemetry */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-4 w-4 text-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-white uppercase tracking-widest">Node_Impact_Metrics</span>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-[9px] font-mono">
              <span className="text-slate-500 uppercase">Impact_Factor</span>
              <span className="text-emerald-400">{impactFactor}</span>
            </div>
            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-1000" 
                style={{ width: `${Math.min(parseFloat(impactFactor) * 10, 100)}%` }} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-4">
            <div className="space-y-1">
              <span className="text-[8px] text-slate-500 uppercase font-mono tracking-tighter">Total_Downloads</span>
              <p className="text-sm font-bold text-white font-mono">{totalDownloads.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[8px] text-slate-500 uppercase font-mono tracking-tighter">Total_Reach</span>
              <p className="text-sm font-bold text-white font-mono">{totalViews.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
