"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, RefreshCcw, Loader2, ExternalLink, Mail } from "lucide-react";
import { toast } from "react-hot-toast";
import { getSiteHealth, refreshLiveSite, type SiteHealth } from "@/core/domain/admin/site-mutations";

/**
 * Overview: is the site connected, and where does each public section get its content?
 * "Built-in" means the page shows the content written into the code, so admin edits
 * for that section won't appear until it has at least one entry here.
 */
export default function SiteHealthPanel({ onOpenTab }: { onOpenTab: (tab: string) => void }) {
  const [health, setHealth] = useState<SiteHealth | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    const r = await getSiteHealth();
    if (r.success && r.data) setHealth(r.data);
    else setError(r.message);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const refresh = async () => {
    setRefreshing(true);
    const r = await refreshLiveSite();
    setRefreshing(false);
    if (r.success) toast.success(r.message);
    else toast.error(r.message);
  };

  if (error) {
    return (
      <section className="rounded-3xl border border-red-500/30 bg-red-500/5 p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
          <XCircle className="h-5 w-5 text-red-400" aria-hidden="true" /> Couldn&apos;t check the site
        </h2>
        <p className="mt-2 text-sm text-slate-300">{error}</p>
        <button onClick={load} className="mt-4 rounded-xl bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700">Try again</button>
      </section>
    );
  }

  if (!health) {
    return <p className="rounded-3xl border border-slate-800 p-8 text-center text-sm text-slate-500">Checking the site…</p>;
  }

  const builtIn = health.sections.filter((s) => s.source === "built-in");

  return (
    <div className="space-y-6">
      {/* Headline status */}
      <section className={`rounded-3xl border p-6 ${health.database.ok ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5"}`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
              {health.database.ok ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400" aria-hidden="true" />
              ) : (
                <XCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
              )}
              {health.database.ok ? "Site connected" : "Database problem"}
            </h2>
            <p className="mt-1 text-sm text-slate-300">{health.database.message}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-cyan-500/50 hover:text-white">
              <ExternalLink className="h-4 w-4" aria-hidden="true" /> View site
            </a>
            <button onClick={refresh} disabled={refreshing} className="flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500 disabled:opacity-60">
              {refreshing ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <RefreshCcw className="h-4 w-4" aria-hidden="true" />}
              Refresh live site
            </button>
          </div>
        </div>
        {health.messagesThisWeek !== null && (
          <button onClick={() => onOpenTab("inquiries")} className="mt-4 flex items-center gap-2 text-sm text-slate-300 hover:text-cyan-400">
            <Mail className="h-4 w-4" aria-hidden="true" />
            {health.messagesThisWeek === 0 ? "No new messages this week" : `${health.messagesThisWeek} message${health.messagesThisWeek === 1 ? "" : "s"} this week`}
          </button>
        )}
      </section>

      {/* Where each section's content comes from */}
      <section className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
        <h2 className="text-lg font-semibold text-white">What the public site shows</h2>
        <p className="mt-1 text-sm text-slate-400">
          {builtIn.length === 0
            ? "Every section is managed here. Anything you save goes live within seconds."
            : "Sections marked “built-in” show the content written into the code. Add the first entry here to take them over; until then, admin changes for that section won’t appear."}
        </p>
        <ul className="mt-5 divide-y divide-slate-800">
          {health.sections.map((s) => (
            <li key={s.key} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-100">{s.label}</p>
                <p className="text-xs text-slate-500">
                  {s.count === null ? "Couldn't count entries" : `${s.count} ${s.count === 1 ? "entry" : "entries"} in the admin`}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${s.source === "admin" ? "bg-emerald-500/10 text-emerald-300" : "bg-amber-500/10 text-amber-300"}`}>
                  {s.source === "admin" ? "Managed here" : "Built-in"}
                </span>
                <button onClick={() => onOpenTab(s.tab)} className="rounded-lg px-2 py-1 text-xs text-cyan-400 hover:bg-slate-800">
                  {s.source === "admin" ? "Edit" : "Add first"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Settings checklist */}
      <section className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
        <h2 className="text-lg font-semibold text-white">Setup checklist</h2>
        <ul className="mt-4 space-y-3">
          {health.settings.map((s) => (
            <li key={s.label} className="flex gap-3">
              {s.ok ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-label="Done" />
              ) : (
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-label="Needs attention" />
              )}
              <div>
                <p className="text-sm text-slate-100">{s.label}</p>
                {!s.ok && <p className="text-xs text-slate-400">{s.help}</p>}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
