"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, Loader2, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { HOME_ICONS, HOMEPAGE_DEFAULT, type HomepageContent } from "@/config/homepage";
import { getHomepageForAdmin, resetHomepage, saveHomepage } from "@/core/domain/admin/site-mutations";
import HomeIcon from "@/presentation/components/shared/HomeIcon";

type Field = { key: string; label: string; type?: "text" | "textarea" | "icon" | "topic"; placeholder?: string };
type ListKey = "pillars" | "audiences" | "steps" | "cta";

const TOPICS = ["Hiring", "Freelance project", "Partnership or investment", "Research collaboration", "Other"];

const LISTS: Record<ListKey, { noun: string; fields: Field[]; blank: Record<string, string> }> = {
  pillars: {
    noun: "pillar",
    fields: [
      { key: "icon", label: "Icon", type: "icon" },
      { key: "title", label: "Title" },
      { key: "body", label: "Text", type: "textarea" },
      { key: "outcome", label: "Result (green line)", placeholder: "What changes for people" },
    ],
    blank: { icon: "Lightbulb", title: "", body: "", outcome: "" },
  },
  audiences: {
    noun: "card",
    fields: [
      { key: "icon", label: "Icon", type: "icon" },
      { key: "who", label: "Who", placeholder: "e.g. Communities" },
      { key: "risk", label: "The risk", type: "textarea" },
      { key: "action", label: "What I do", type: "textarea" },
      { key: "linkText", label: "Link text", placeholder: "See the research" },
      { key: "href", label: "Link", placeholder: "/research or https://…" },
    ],
    blank: { icon: "Users", who: "", risk: "", action: "", linkText: "", href: "/projects" },
  },
  steps: {
    noun: "step",
    fields: [
      { key: "icon", label: "Icon", type: "icon" },
      { key: "title", label: "Title" },
      { key: "body", label: "Text", type: "textarea" },
    ],
    blank: { icon: "Target", title: "", body: "" },
  },
  cta: {
    noun: "option",
    fields: [
      { key: "icon", label: "Icon", type: "icon" },
      { key: "title", label: "Title" },
      { key: "body", label: "Text", type: "textarea" },
      { key: "topic", label: "Opens the contact form with", type: "topic" },
    ],
    blank: { icon: "Briefcase", title: "", body: "", topic: "Other" },
  },
};

const input = "w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none";
const label = "mb-1 block text-xs font-medium text-slate-400";

/** Edit every homepage section: headings, text, cards, icons, order and visibility. */
export default function HomepageEditor() {
  const [data, setData] = useState<HomepageContent | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = () => {
    setLoadError(null);
    getHomepageForAdmin().then((r) => {
      if (r.success && r.data) {
        setData(r.data.content);
        setSaved(r.data.saved);
      } else {
        // Show today's built-in content so the layout can still be reviewed; saving stays off.
        setLoadError(r.message);
        setData((prev) => prev ?? HOMEPAGE_DEFAULT);
      }
    });
  };

  useEffect(load, []);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  if (!data) return <p className="rounded-3xl border border-slate-800 p-10 text-center text-sm text-slate-500">Loading the homepage…</p>;

  const update = (next: HomepageContent) => {
    setData(next);
    setDirty(true);
  };

  const setSection = <K extends keyof HomepageContent>(key: K, patch: Partial<HomepageContent[K]>) =>
    update({ ...data, [key]: { ...data[key], ...patch } });

  const onSave = async () => {
    setBusy(true);
    const r = await saveHomepage(data);
    setBusy(false);
    if (r.success) {
      toast.success(r.message);
      setDirty(false);
      setSaved(true);
    } else toast.error(r.message);
  };

  const onReset = async () => {
    if (!confirm("Go back to the built-in homepage text? Your saved changes to these sections will be removed.")) return;
    setBusy(true);
    const r = await resetHomepage();
    setBusy(false);
    if (!r.success) return void toast.error(r.message);
    toast.success(r.message);
    const fresh = await getHomepageForAdmin();
    if (fresh.success && fresh.data) {
      setData(fresh.data.content);
      setSaved(false);
      setDirty(false);
    }
  };

  const header = (key: keyof HomepageContent, name: string, opts: { title?: boolean } = { title: true }) => {
    const sec = data[key] as { visible: boolean; title?: string; intro?: string };
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-white">{name}</h3>
          <button
            type="button"
            onClick={() => setSection(key, { visible: !sec.visible } as never)}
            aria-pressed={sec.visible}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${sec.visible ? "bg-emerald-500/10 text-emerald-300" : "bg-slate-800 text-slate-400"}`}
          >
            {sec.visible ? <Eye className="h-3.5 w-3.5" aria-hidden="true" /> : <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />}
            {sec.visible ? "Shown" : "Hidden"}
          </button>
        </div>
        {opts.title && (
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className={label} htmlFor={`${key}-title`}>Heading</label>
              <input id={`${key}-title`} className={input} value={sec.title ?? ""} onChange={(e) => setSection(key, { title: e.target.value } as never)} />
            </div>
            <div>
              <label className={label} htmlFor={`${key}-intro`}>Line under the heading</label>
              <input id={`${key}-intro`} className={input} value={sec.intro ?? ""} onChange={(e) => setSection(key, { intro: e.target.value } as never)} />
            </div>
          </div>
        )}
      </div>
    );
  };

  const list = (key: ListKey) => {
    const cfg = LISTS[key];
    const items = data[key].items as Array<Record<string, string>>;
    const setItems = (next: Array<Record<string, string>>) => setSection(key, { items: next } as never);
    const move = (i: number, d: -1 | 1) => {
      const next = [...items];
      [next[i], next[i + d]] = [next[i + d], next[i]];
      setItems(next);
    };
    return (
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium text-slate-200">
                <HomeIcon name={item.icon} className="h-4 w-4 text-cyan-400" />
                {item.title || item.who || `New ${cfg.noun}`}
              </span>
              <span className="flex gap-1">
                <button type="button" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up" className="rounded p-1.5 text-slate-400 hover:bg-slate-800 disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
                <button type="button" disabled={i === items.length - 1} onClick={() => move(i, 1)} aria-label="Move down" className="rounded p-1.5 text-slate-400 hover:bg-slate-800 disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
                <button type="button" onClick={() => setItems(items.filter((_, j) => j !== i))} aria-label={`Remove ${cfg.noun}`} className="rounded p-1.5 text-slate-400 hover:bg-red-500/10 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
              </span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {cfg.fields.map((f) => {
                const id = `${key}-${i}-${f.key}`;
                const set = (v: string) => setItems(items.map((x, j) => (j === i ? { ...x, [f.key]: v } : x)));
                return (
                  <div key={f.key} className={f.type === "textarea" ? "md:col-span-2" : undefined}>
                    <label className={label} htmlFor={id}>{f.label}</label>
                    {f.type === "textarea" ? (
                      <textarea id={id} rows={3} className={input} value={item[f.key] ?? ""} onChange={(e) => set(e.target.value)} />
                    ) : f.type === "icon" ? (
                      <select id={id} className={input} value={item[f.key]} onChange={(e) => set(e.target.value)}>
                        {HOME_ICONS.map((n) => <option key={n} value={n}>{n}</option>)}
                      </select>
                    ) : f.type === "topic" ? (
                      <select id={id} className={input} value={item[f.key]} onChange={(e) => set(e.target.value)}>
                        {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    ) : (
                      <input id={id} className={input} placeholder={f.placeholder} value={item[f.key] ?? ""} onChange={(e) => set(e.target.value)} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <button type="button" onClick={() => setItems([...items, { ...cfg.blank }])} className="flex items-center gap-2 rounded-xl border border-dashed border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-cyan-500/50 hover:text-white">
          <Plus className="h-4 w-4" aria-hidden="true" /> Add {cfg.noun}
        </button>
      </div>
    );
  };

  const card = "space-y-5 rounded-3xl border border-slate-800 bg-slate-900/40 p-6";

  return (
    <div className="space-y-6">
      {loadError && (
        <div role="alert" className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5 text-sm text-slate-300">
          <p className="font-semibold text-white">Couldn&apos;t load your saved homepage, so saving is off</p>
          <p className="mt-1">{loadError}</p>
          <p className="mt-1 text-slate-400">Below is the built-in homepage, for reference. Check Overview: the database may not be connected yet.</p>
          <button type="button" onClick={load} className="mt-3 rounded-xl bg-slate-800 px-4 py-2 text-white hover:bg-slate-700">Try again</button>
        </div>
      )}

      {/* Save bar */}
      <div className="sticky top-16 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/90 px-5 py-3 backdrop-blur">
        <p className="text-sm text-slate-400">
          {dirty ? "You have unsaved changes." : saved ? "Showing your saved homepage." : "Showing the built-in homepage. Save to start managing it here."}
        </p>
        <div className="flex gap-2">
          {saved && (
            <button type="button" onClick={onReset} disabled={busy} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white">
              <RotateCcw className="h-4 w-4" aria-hidden="true" /> Reset
            </button>
          )}
          <button type="button" onClick={onSave} disabled={busy || !dirty || Boolean(loadError)} className="flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2 text-sm font-medium text-white hover:bg-cyan-500 disabled:opacity-50">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
            Save homepage
          </button>
        </div>
      </div>

      <p className="text-sm text-slate-500">
        The headline, intro and open-to-work badge are under <strong className="text-slate-300">Homepage intro</strong>. Featured projects are chosen in <strong className="text-slate-300">Projects &amp; ventures</strong>; roles come from <strong className="text-slate-300">Experience</strong>.
      </p>

      <section className={card}>
        {header("recognition", "Recognition (badges under the intro)", { title: false })}
        <div className="space-y-2">
          {data.recognition.items.map((r, i) => (
            <div key={i} className="flex gap-2">
              <input aria-label="Recognition" className={input} value={r.text} placeholder="e.g. 2nd place, Hacktoberfest 2026" onChange={(e) => setSection("recognition", { items: data.recognition.items.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)) })} />
              <input aria-label="Detail" className={`${input} max-w-[40%]`} value={r.detail} placeholder="small line, e.g. with DukaAI" onChange={(e) => setSection("recognition", { items: data.recognition.items.map((x, j) => (j === i ? { ...x, detail: e.target.value } : x)) })} />
              <button type="button" onClick={() => setSection("recognition", { items: data.recognition.items.filter((_, j) => j !== i) })} aria-label="Remove" className="rounded-lg p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          <button type="button" onClick={() => setSection("recognition", { items: [...data.recognition.items, { text: "", detail: "" }] })} className="flex items-center gap-2 rounded-xl border border-dashed border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-cyan-500/50 hover:text-white">
            <Plus className="h-4 w-4" aria-hidden="true" /> Add recognition
          </button>
        </div>
      </section>

      <section className={card}>{header("pillars", "Pillars (what I do)")}{list("pillars")}</section>
      <section className={card}>{header("featured", "Featured projects section")}</section>
      <section className={card}>{header("audiences", "Who my work protects")}{list("audiences")}</section>
      <section className={card}>{header("steps", "How I work (steps)")}{list("steps")}</section>

      <section className={card}>
        {header("experience", "Experience and learning")}
        <div>
          <label className={label} htmlFor="learning-title">Learning list heading</label>
          <input id="learning-title" className={input} value={data.experience.learningTitle} onChange={(e) => setSection("experience", { learningTitle: e.target.value })} />
        </div>
        <div className="space-y-2">
          {data.experience.learning.map((l, i) => (
            <div key={i} className="flex gap-2">
              <input aria-label="Learning item" className={input} value={l} onChange={(e) => setSection("experience", { learning: data.experience.learning.map((x, j) => (j === i ? e.target.value : x)) })} />
              <button type="button" onClick={() => setSection("experience", { learning: data.experience.learning.filter((_, j) => j !== i) })} aria-label="Remove" className="rounded-lg p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          <button type="button" onClick={() => setSection("experience", { learning: [...data.experience.learning, ""] })} className="flex items-center gap-2 rounded-xl border border-dashed border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-cyan-500/50 hover:text-white">
            <Plus className="h-4 w-4" aria-hidden="true" /> Add learning item
          </button>
        </div>
      </section>

      <section className={card}>{header("cta", "Closing call to action")}{list("cta")}</section>
    </div>
  );
}
