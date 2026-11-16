"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, ExternalLink, Loader2, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { SETTINGS_DEFAULT, type SiteSettings } from "@/config/settings";
import { getSettingsForAdmin, resetSettings, saveSettings } from "@/core/domain/admin/site-mutations";

const input = "w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none";
const label = "mb-1 block text-xs font-medium text-slate-400";
const card = "space-y-4 rounded-3xl border border-slate-800 bg-slate-900/40 p-6";

type PageKey = keyof SiteSettings["pages"];
const PAGES: Array<[PageKey, string, string]> = [
  ["projects", "Projects page", "/projects"],
  ["research", "Research page", "/research"],
  ["blog", "Blog page", "/blog"],
  ["resume", "Resume page", "/resume"],
  ["contact", "Contact page", "/contact"],
];

type Pair = { a: string; b: string };

/** Editable list of two-field rows (title + text), with reorder and remove. */
function PairList({ items, onChange, aLabel, bLabel, noun }: { items: Pair[]; onChange: (v: Pair[]) => void; aLabel: string; bLabel: string; noun: string }) {
  const move = (i: number, d: -1 | 1) => { const n = [...items]; [n[i], n[i + d]] = [n[i + d], n[i]]; onChange(n); };
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="grid gap-2 rounded-2xl border border-slate-800 bg-slate-950/60 p-3 md:grid-cols-[1fr_2fr_auto]">
          <input aria-label={aLabel} placeholder={aLabel} className={input} value={it.a} onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)))} />
          <input aria-label={bLabel} placeholder={bLabel} className={input} value={it.b} onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, b: e.target.value } : x)))} />
          <span className="flex">
            <button type="button" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up" className="rounded p-1.5 text-slate-400 hover:bg-slate-800 disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
            <button type="button" disabled={i === items.length - 1} onClick={() => move(i, 1)} aria-label="Move down" className="rounded p-1.5 text-slate-400 hover:bg-slate-800 disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label={`Remove ${noun}`} className="rounded p-1.5 text-slate-400 hover:bg-red-500/10 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
          </span>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, { a: "", b: "" }])} className="flex items-center gap-2 rounded-xl border border-dashed border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-cyan-500/50 hover:text-white">
        <Plus className="h-4 w-4" aria-hidden="true" /> Add {noun}
      </button>
    </div>
  );
}

/** Contact details, social links, page headings, research areas, skills and Google verification. */
export default function SettingsEditor() {
  const [s, setS] = useState<SiteSettings | null>(null);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = () => {
    setLoadError(null);
    getSettingsForAdmin().then((r) => {
      if (r.success && r.data) {
        setS(r.data.settings);
        setSaved(r.data.saved);
      } else {
        setLoadError(r.message);
        setS((prev) => prev ?? SETTINGS_DEFAULT);
      }
    });
  };
  useEffect(load, []);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  if (!s) return <p className="rounded-3xl border border-slate-800 p-10 text-center text-sm text-slate-500">Loading settings…</p>;

  const update = (next: SiteSettings) => { setS(next); setDirty(true); };
  const patch = <K extends keyof SiteSettings>(k: K, v: Partial<SiteSettings[K]>) => update({ ...s, [k]: { ...s[k], ...v } });
  const field = (id: string, text: string, value: string, onChange: (v: string) => void, opts: { placeholder?: string; area?: boolean; max?: number } = {}) => (
    <div>
      <label className={label} htmlFor={id}>{text}</label>
      {opts.area ? (
        <textarea id={id} rows={3} maxLength={opts.max} className={input} value={value} placeholder={opts.placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input id={id} maxLength={opts.max} className={input} value={value} placeholder={opts.placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
      {opts.max && <p className="mt-0.5 text-right text-[11px] text-slate-600">{value.length}/{opts.max}</p>}
    </div>
  );

  const onSave = async () => {
    setBusy(true);
    const r = await saveSettings(s);
    setBusy(false);
    if (r.success) { toast.success(r.message); setDirty(false); setSaved(true); } else toast.error(r.message);
  };
  const onReset = async () => {
    if (!confirm("Go back to the built-in settings? Your saved changes here will be removed.")) return;
    setBusy(true);
    const r = await resetSettings();
    setBusy(false);
    if (!r.success) return void toast.error(r.message);
    toast.success(r.message);
    load();
    setDirty(false);
  };

  return (
    <div className="space-y-6">
      {loadError && (
        <div role="alert" className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5 text-sm text-slate-300">
          <p className="font-semibold text-white">Couldn&apos;t load your saved settings, so saving is off</p>
          <p className="mt-1">{loadError}</p>
          <p className="mt-1 text-slate-400">Below are the built-in settings, for reference. Check Overview: the database may not be connected yet.</p>
          <button type="button" onClick={load} className="mt-3 rounded-xl bg-slate-800 px-4 py-2 text-white hover:bg-slate-700">Try again</button>
        </div>
      )}

      <div className="sticky top-16 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/90 px-5 py-3 backdrop-blur">
        <p className="text-sm text-slate-400">{dirty ? "You have unsaved changes." : saved ? "Showing your saved settings." : "Showing the built-in settings. Save to start managing them here."}</p>
        <div className="flex gap-2">
          {saved && (
            <button type="button" onClick={onReset} disabled={busy} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white">
              <RotateCcw className="h-4 w-4" aria-hidden="true" /> Reset
            </button>
          )}
          <button type="button" onClick={onSave} disabled={busy || !dirty || Boolean(loadError)} className="flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2 text-sm font-medium text-white hover:bg-cyan-500 disabled:opacity-50">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
            Save settings
          </button>
        </div>
      </div>

      <section className={card}>
        <h3 className="text-base font-semibold text-white">Contact details <span className="text-sm font-normal text-slate-500">(footer and Contact page)</span></h3>
        <div className="grid gap-4 md:grid-cols-3">
          {field("set-email", "Email", s.contact.email, (v) => patch("contact", { email: v }))}
          {field("set-location", "Location", s.contact.location, (v) => patch("contact", { location: v }))}
          {field("set-response", "Reply time", s.contact.responseTime, (v) => patch("contact", { responseTime: v }), { placeholder: "I reply within 1–2 working days." })}
        </div>
      </section>

      <section className={card}>
        <h3 className="text-base font-semibold text-white">Social links <span className="text-sm font-normal text-slate-500">(leave empty to hide)</span></h3>
        <div className="grid gap-4 md:grid-cols-2">
          {field("set-li", "LinkedIn", s.social.linkedin, (v) => patch("social", { linkedin: v }), { placeholder: "https://www.linkedin.com/in/…" })}
          {field("set-gh", "GitHub", s.social.github, (v) => patch("social", { github: v }), { placeholder: "https://github.com/…" })}
          {field("set-x", "X (Twitter)", s.social.x, (v) => patch("social", { x: v }), { placeholder: "https://x.com/…" })}
          {field("set-ig", "Instagram", s.social.instagram, (v) => patch("social", { instagram: v }), { placeholder: "https://www.instagram.com/…" })}
        </div>
      </section>

      <section className={card}>
        <h3 className="text-base font-semibold text-white">How you&apos;re described</h3>
        {field("set-pos", "One-line positioning (shown in the footer)", s.identity.positioning, (v) => patch("identity", { positioning: v }), { area: true, max: 200 })}
        {field("set-desc", "Site description in Google results (homepage)", s.identity.description, (v) => patch("identity", { description: v }), { area: true, max: 300 })}
        <p className="text-xs text-slate-500">Your name, the homepage headline and intro are under <strong className="text-slate-300">Homepage intro</strong>.</p>
      </section>

      {PAGES.map(([key, name, href]) => (
        <section key={key} className={card}>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">{name}</h3>
            <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"><ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /> View</a>
          </div>
          <div className="grid gap-4 md:grid-cols-[1fr_2fr]">
            {field(`set-${key}-title`, "Heading", s.pages[key].title, (v) => update({ ...s, pages: { ...s.pages, [key]: { ...s.pages[key], title: v } } }))}
            {field(`set-${key}-intro`, "Intro under the heading", s.pages[key].intro, (v) => update({ ...s, pages: { ...s.pages, [key]: { ...s.pages[key], intro: v } } }), { area: true, max: 500 })}
          </div>
          {field(`set-${key}-seo`, "Description in Google results (50–160 characters works best)", s.pages[key].seoDescription, (v) => update({ ...s, pages: { ...s.pages, [key]: { ...s.pages[key], seoDescription: v } } }), { area: true, max: 300 })}

          {key === "research" && (
            <>
              <div>
                <p className={label}>The four steps under the intro</p>
                <PairList noun="step" aLabel="Step" bLabel="What it means"
                  items={s.research.steps.map((x) => ({ a: x.title, b: x.body }))}
                  onChange={(v) => patch("research", { steps: v.map((x) => ({ title: x.a, body: x.b })) })} />
              </div>
              {field("set-focus-title", "Research areas heading", s.research.focusTitle, (v) => patch("research", { focusTitle: v }))}
              <PairList noun="research area" aLabel="Area" bLabel="What you study"
                items={s.research.focus.map((x) => ({ a: x.title, b: x.body }))}
                onChange={(v) => patch("research", { focus: v.map((x) => ({ title: x.a, body: x.b })) })} />
            </>
          )}

          {key === "resume" && (
            <div>
              <p className={label}>Skills</p>
              <PairList noun="skill group" aLabel="Group, e.g. Front end" bLabel="Tools and skills, separated by commas"
                items={s.resume.skills.map((x) => ({ a: x.name, b: x.tools }))}
                onChange={(v) => patch("resume", { skills: v.map((x) => ({ name: x.a, tools: x.b })) })} />
            </div>
          )}
        </section>
      ))}

      <section className={card}>
        <h3 className="text-base font-semibold text-white">Google Search Console</h3>
        <p className="text-sm text-slate-400">
          In Search Console choose <strong className="text-slate-200">URL prefix</strong> → <strong className="text-slate-200">HTML tag</strong>. Google shows
          {" "}<code className="rounded bg-slate-800 px-1 text-xs text-slate-200">&lt;meta name=&quot;google-site-verification&quot; content=&quot;ABC123…&quot; /&gt;</code>.
          Paste only the part inside <code className="rounded bg-slate-800 px-1 text-xs text-slate-200">content=&quot;…&quot;</code>, save, wait a minute, then press Verify.
        </p>
        {field("set-gsc", "Verification code", s.seo.googleVerification, (v) => patch("seo", { googleVerification: v.replace(/^.*content="([^"]*)".*$/, "$1").trim() }), { placeholder: "e.g. 1a2B3c…", max: 100 })}
      </section>
    </div>
  );
}
