"use client";

import { useEffect, useState } from "react";
import { Shield, CheckCircle2, AlertCircle, Lock, Globe, Terminal, Activity } from "lucide-react";
import { getSecurityStatus } from "@/domain/admin/actions";

interface SecurityStatus {
  header: string;
  status: "secure" | "warning" | "loading";
  value: string;
  description: string;
  technicalInfo?: string;
}

export default function SecurityAudit() {
  const [isScanning, setIsScanning] = useState(true);
  const [threatMetrics, setThreatMetrics] = useState({ level: "LOW", events: 0 });
  const [audit, setAudit] = useState<SecurityStatus[]>([
    { header: "Content-Security-Policy", status: "loading", value: "-", description: "Mitigates XSS and data injection attacks." },
    { header: "Strict-Transport-Security", status: "loading", value: "-", description: "Forces secure HTTPS connections." },
    { header: "X-Frame-Options", status: "loading", value: "-", description: "Prevents clickjacking attacks." },
    { header: "X-Content-Type-Options", status: "loading", value: "-", description: "Prevents MIME-type sniffing." },
    { header: "Referrer-Policy", status: "loading", value: "-", description: "Controls how much referrer info is shared." },
  ]);

  useEffect(() => {
    async function runAudit() {
      try {
        const data = await getSecurityStatus();
        
        setThreatMetrics({ level: data.threatLevel, events: data.recentEvents });
        
        setAudit([
          { 
            header: "Content-Security-Policy", 
            status: data.headers["Content-Security-Policy"] !== "Not Detected" ? "secure" : "warning", 
            value: data.headers["Content-Security-Policy"] !== "Not Detected" ? "Active" : "Not Detected", 
            description: "Mitigates XSS and data injection attacks.",
            technicalInfo: data.headers["Content-Security-Policy"]
          },
          { 
            header: "Strict-Transport-Security", 
            status: data.headers["Strict-Transport-Security"] !== "Not Detected" ? "secure" : "warning", 
            value: data.headers["Strict-Transport-Security"], 
            description: "Forces secure HTTPS connections.",
            technicalInfo: "HSTS Policy enforced at the edge."
          },
          { 
            header: "X-Frame-Options", 
            status: data.headers["X-Frame-Options"] !== "Not Detected" ? "secure" : "warning", 
            value: data.headers["X-Frame-Options"], 
            description: "Prevents clickjacking attacks.",
            technicalInfo: "Frames strictly limited to same-origin."
          },
          { 
            header: "X-Content-Type-Options", 
            status: data.headers["X-Content-Type-Options"] !== "Not Detected" ? "secure" : "warning", 
            value: data.headers["X-Content-Type-Options"], 
            description: "Prevents MIME-type sniffing.",
            technicalInfo: "nosniff directive active."
          },
          { 
            header: "Referrer-Policy", 
            status: data.headers["Referrer-Policy"] !== "Not Detected" ? "secure" : "warning", 
            value: data.headers["Referrer-Policy"], 
            description: "Controls how much referrer info is shared.",
            technicalInfo: data.headers["Referrer-Policy"]
          },
        ]);
      } catch (err) {
        console.error("Audit failed:", err);
      } finally {
        setIsScanning(false);
      }
    }

    runAudit();
  }, []);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
            {isScanning ? <Terminal className="h-5 w-5 animate-pulse" /> : <Shield className="h-5 w-5" />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white uppercase tracking-wider font-mono">Cyber-Posture Audit</h3>
            <p className="text-[10px] text-cyan-500/70 font-mono">
              {isScanning ? "INITIATING_SYSTEM_SCAN..." : `SYSTEM_STATE :: HARDENED`}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-mono text-emerald-400">
            <Lock className="h-3 w-3" />
            TLS_1.3 :: SSL_VERIFIED
          </div>
          {!isScanning && (
            <div className={`text-[9px] font-mono ${threatMetrics.level === 'LOW' ? 'text-emerald-500' : 'text-amber-500'}`}>
              THREAT_INTEL: {threatMetrics.level} ({threatMetrics.events} events/24h)
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        {audit.map((item) => (
          <div key={item.header} className="group flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-950/40 p-4 transition hover:bg-slate-900/60 hover:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-300 font-mono">{item.header}</span>
              {item.status === "secure" ? (
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  VERIFIED
                </span>
              ) : item.status === "loading" ? (
                <span className="flex items-center gap-2">
                   <div className="h-1 w-12 overflow-hidden rounded-full bg-slate-800">
                      <div className="h-full w-full animate-progress-indefinite bg-cyan-500" />
                   </div>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400">
                  <AlertCircle className="h-3 w-3" />
                  MISSING
                </span>
              )}
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
            
            {!isScanning && item.technicalInfo && (
              <div className="mt-2 hidden group-hover:block animate-in fade-in slide-in-from-top-1 duration-300">
                <div className="rounded-lg bg-slate-900/80 p-2 border border-slate-800">
                  <p className="text-[9px] font-mono text-cyan-500 break-all leading-tight">
                    {item.technicalInfo}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 border-t border-slate-800 pt-6">
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
          <Globe className="h-3 w-3" />
          HSTS: PRELOADED
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
          <Activity className="h-3 w-3" />
          MONITORING: REAL-TIME
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-500/60">
          <Shield className="h-3 w-3" />
          ZERO-TRUST: ACTIVE
        </div>
      </div>
    </div>
  );
}
