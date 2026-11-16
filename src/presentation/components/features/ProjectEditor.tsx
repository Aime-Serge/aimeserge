"use client";

import { useRef, useState } from "react";
import {
  ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ExternalLink, FolderKanban, ImagePlus, Loader2, Plus, Save, Trash2, X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { upsertContent, uploadArtifact } from "@/core/domain/admin/mutations";

/** Suggestions only: any short label works (e.g. "Safety · AI · IoT"). */
const CATEGORY_SUGGESTIONS = [
  "AI", "Security", "Cloud", "Full-Stack", "Software Engineering",
  "Health · AI", "Fintech · AI", "Security · AI", "Safety · AI · IoT", "E-commerce · Logistics",
];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const YEARS = Array.from({ length: 20 }, (_, i) => String(new Date().getFullYear() - i));
const MAX_IMAGE_MB = 5;

type MonthYear = { month: string; year: string };

interface ProjectFormData {
  id?: string;
  title: string;
  slug: string;
  tagline: string;
  role: string;
  category: string;
  summary: string;
  description: string;
  tools: string[];
  features: string[];
  images: string[];
  url: string;
  pdf_url: string;
  video_url: string;
  is_visible: boolean;
  is_current: boolean;
  start_date: MonthYear;
  end_date: MonthYear | null;
  contributors: string[];
  association: string;
  featured: boolean;
  sort_order: number;
}

interface ProjectEditorProps {
  initialData?: Partial<ProjectFormData> & Record<string, unknown>;
  onClose: () => void;
}

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

const str = (v: unknown) => (typeof v === "string" ? v : "");
const list = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);
const my = (v: unknown): MonthYear | null =>
  v && typeof v === "object" && "year" in v ? { month: str((v as MonthYear).month) || "January", year: str((v as MonthYear).year) } : null;

const input = "w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none";
const label = "mb-1.5 block text-sm font-medium text-slate-300";
const hint = "font-normal text-slate-500";
const box = "space-y-4 rounded-2xl border border-slate-800 bg-slate-950/50 p-5";

/** Chip list for tools and people. */
function Chips({ id, items, onChange, placeholder }: { id: string; items: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (v && !items.includes(v)) onChange([...items, v]);
    setDraft("");
  };
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input id={id} value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())} className={input} placeholder={placeholder} />
        <button type="button" onClick={add} aria-label="Add" className="rounded-xl bg-slate-800 px-3 text-cyan-400 hover:bg-slate-700"><Plus className="h-4 w-4" /></button>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((t) => (
            <span key={t} className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-200">
              {t}
              <button type="button" onClick={() => onChange(items.filter((x) => x !== t))} aria-label={`Remove ${t}`} className="text-slate-400 hover:text-red-400"><X className="h-3 w-3" /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProjectEditor({ initialData, onClose }: ProjectEditorProps) {
  const isNew = !initialData?.id;
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);
  const slugTouched = useRef(!isNew);
  const fileRef = useRef<HTMLInputElement>(null);

  const [f, setF] = useState<ProjectFormData>(() => {
    const d = initialData ?? {};
    const start = my(d.start_date ?? d.startDate) ?? { month: MONTHS[new Date().getMonth()], year: String(new Date().getFullYear()) };
    return {
      id: str(d.id) || undefined,
      title: str(d.title),
      slug: str(d.slug),
      tagline: str(d.tagline),
      role: str(d.role),
      category: str(d.category),
      summary: str(d.summary),
      description: str(d.description),
      tools: list(d.tools),
      features: list(d.features),
      images: list(d.images),
      url: str(d.url),
      pdf_url: str(d.pdf_url ?? d.pdfUrl),
      video_url: str(d.video_url ?? d.videoUrl),
      is_visible: d.is_visible === undefined && d.isVisible === undefined ? true : Boolean(d.is_visible ?? d.isVisible),
      is_current: Boolean(d.is_current ?? d.isCurrent),
      start_date: start,
      end_date: my(d.end_date ?? d.endDate),
      contributors: list(d.contributors).length ? list(d.contributors) : ["Aime Serge UKOBIZABA"],
      association: str(d.association),
      featured: Boolean(d.featured),
      sort_order: Number(d.sort_order ?? d.sortOrder ?? 0) || 0,
    };
  });
  const set = <K extends keyof ProjectFormData>(k: K, v: ProjectFormData[K]) => setF((prev) => ({ ...prev, [k]: v }));

  const uploadImages = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    const added: string[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) { toast.error(`${file.name} isn't an image.`); continue; }
      if (file.size > MAX_IMAGE_MB * 1024 * 1024) { toast.error(`${file.name} is over ${MAX_IMAGE_MB} MB.`); continue; }
      const r = await uploadArtifact({ file, path: "projects" });
      if (r.success && "url" in r && r.url) added.push(r.url as string);
      else toast.error(`Couldn't upload ${file.name}: ${"error" in r ? r.error : "unknown error"}`);
    }
    if (added.length) {
      setF((prev) => ({ ...prev, images: [...prev.images, ...added] }));
      toast.success(added.length === 1 ? "Picture added." : `${added.length} pictures added.`);
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const moveImage = (i: number, d: -1 | 1) => {
    const next = [...f.images];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    set("images", next);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = slugify(f.slug || f.title);
    if (!slug) return void toast.error("Add a title.");
    if (!f.category.trim()) return void toast.error("Add a category, e.g. Health · AI.");
    if (!f.is_current && f.end_date && Number(f.end_date.year) < Number(f.start_date.year)) return void toast.error("The end date is before the start date.");

    setSaving(true);
    const payload = {
      ...f,
      slug,
      category: f.category.trim(),
      summary: f.summary.trim() || f.tagline.trim(),
      features: f.features.map((x) => x.trim()).filter(Boolean),
      url: f.url.trim() || null,
      pdf_url: f.pdf_url.trim() || null,
      video_url: f.video_url.trim() || null,
      end_date: f.is_current ? null : f.end_date,
    };
    const r = await upsertContent({ table: "projects", payload, path: "/projects" });
    setSaving(false);
    if (r.success) {
      toast.success("Project saved. The public pages update within seconds.");
      setSavedSlug(slug);
      if (r.data && typeof r.data === "object" && "id" in r.data) set("id", (r.data as { id: string }).id);
      set("slug", slug);
    } else {
      toast.error(`Couldn't save: ${"error" in r ? r.error : "unknown error"}`);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">
      <div className="mb-6 flex items-center justify-between border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-600/20">
            <FolderKanban className="h-5 w-5 text-cyan-400" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{isNew ? "New project" : `Edit ${f.title || "project"}`}</h2>
            <p className="text-xs text-slate-500">Fields marked * are required. Everything here shows on the project page.</p>
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white"><X className="h-5 w-5" /></button>
      </div>

      {savedSlug && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-sm text-emerald-200">
          <span>Saved. {f.is_visible ? "It's live on the site." : "It's hidden from visitors."}</span>
          <span className="flex gap-2">
            {f.is_visible && (
              <a href={`/projects/${savedSlug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 font-medium text-white hover:bg-emerald-500">
                <ExternalLink className="h-4 w-4" aria-hidden="true" /> View page
              </a>
            )}
            <button type="button" onClick={onClose} className="rounded-lg px-3 py-1.5 text-emerald-100 hover:bg-emerald-500/20">Done</button>
          </span>
        </div>
      )}

      <form onSubmit={handleSave} className="max-h-[70vh] space-y-6 overflow-y-auto pr-1">
        {/* Basics */}
        <div className={box}>
          <h3 className="text-sm font-semibold text-white">The basics</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="p-title" className={label}>Project name *</label>
              <input id="p-title" required maxLength={120} value={f.title} className={input} placeholder="e.g. Sentinel"
                onChange={(e) => { const title = e.target.value; setF((p) => ({ ...p, title, slug: slugTouched.current ? p.slug : slugify(title) })); }} />
            </div>
            <div>
              <label htmlFor="p-slug" className={label}>Page address <span className={hint}>/projects/…</span></label>
              <input id="p-slug" value={f.slug} className={`${input} font-mono text-slate-300`} placeholder="filled in from the name"
                onChange={(e) => { slugTouched.current = true; set("slug", e.target.value); }} />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="p-tagline" className={label}>One-line description * <span className={hint}>(shown on cards and under the title)</span></label>
              <input id="p-tagline" required maxLength={200} value={f.tagline} onChange={(e) => set("tagline", e.target.value)} className={input} placeholder="What it does for people, in one sentence" />
            </div>
            <div>
              <label htmlFor="p-role" className={label}>Your role *</label>
              <input id="p-role" required maxLength={120} value={f.role} onChange={(e) => set("role", e.target.value)} className={input} placeholder="e.g. Founder & Lead Engineer" />
            </div>
            <div>
              <label htmlFor="p-category" className={label}>Category *</label>
              <input id="p-category" list="project-category-suggestions" required maxLength={60} value={f.category} onChange={(e) => set("category", e.target.value)} className={input} placeholder="e.g. Health · AI" />
              <datalist id="project-category-suggestions">{CATEGORY_SUGGESTIONS.map((c) => <option key={c} value={c} />)}</datalist>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="p-assoc" className={label}>Associated with <span className={hint}>(organisation, programme or “Independent Project”)</span></label>
              <input id="p-assoc" maxLength={160} value={f.association} onChange={(e) => set("association", e.target.value)} className={input} placeholder="e.g. Independent Venture · Public safety" />
            </div>
          </div>
        </div>

        {/* Pictures */}
        <div className={box}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-white">Pictures <span className={hint}>(the first one is the thumbnail on cards)</span></h3>
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="flex items-center gap-2 rounded-xl bg-slate-800 px-3 py-2 text-sm text-white hover:bg-slate-700 disabled:opacity-60">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ImagePlus className="h-4 w-4" aria-hidden="true" />}
              Upload pictures
            </button>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif" multiple hidden onChange={(e) => uploadImages(e.target.files)} />
          </div>
          {f.images.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-500">
              No pictures yet. Upload a screenshot or logo (PNG, JPG, WebP or SVG, up to {MAX_IMAGE_MB} MB). A 16:9 picture looks best.
            </p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {f.images.map((src, i) => (
                <li key={src} className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="aspect-video w-full object-cover" />
                  <div className="flex items-center justify-between px-2 py-1.5 text-xs text-slate-400">
                    <span>{i === 0 ? "Thumbnail" : `Picture ${i + 1}`}</span>
                    <span className="flex">
                      <button type="button" disabled={i === 0} onClick={() => moveImage(i, -1)} aria-label="Move earlier" className="rounded p-1 hover:bg-slate-800 disabled:opacity-30"><ArrowLeft className="h-4 w-4" /></button>
                      <button type="button" disabled={i === f.images.length - 1} onClick={() => moveImage(i, 1)} aria-label="Move later" className="rounded p-1 hover:bg-slate-800 disabled:opacity-30"><ArrowRight className="h-4 w-4" /></button>
                      <button type="button" onClick={() => set("images", f.images.filter((_, j) => j !== i))} aria-label="Remove picture" className="rounded p-1 hover:bg-red-500/10 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Story */}
        <div className={box}>
          <h3 className="text-sm font-semibold text-white">The story</h3>
          <div>
            <label htmlFor="p-summary" className={label}>Short summary <span className={hint}>(2 sentences, used in search and previews)</span></label>
            <textarea id="p-summary" rows={2} maxLength={500} value={f.summary} onChange={(e) => set("summary", e.target.value)} className={input} />
          </div>
          <div>
            <label htmlFor="p-desc" className={label}>
              Full story * <span className={hint}>(leave a blank line between paragraphs. Tip: “The problem:”, “What I built:”, “Built responsibly:”, “Status:”)</span>
            </label>
            <textarea id="p-desc" required rows={12} maxLength={8000} value={f.description} onChange={(e) => set("description", e.target.value)} className={`${input} leading-relaxed`} />
            <p className="mt-1 text-right text-xs text-slate-500">{f.description.length.toLocaleString()} / 8,000</p>
          </div>
        </div>

        {/* What it does */}
        <div className={box}>
          <h3 className="text-sm font-semibold text-white">“What it does” <span className={hint}>(bullet points on the project page)</span></h3>
          <ul className="space-y-2">
            {f.features.map((feat, i) => (
              <li key={i} className="flex gap-2">
                <input aria-label={`Point ${i + 1}`} value={feat} maxLength={200} className={input} onChange={(e) => set("features", f.features.map((x, j) => (j === i ? e.target.value : x)))} />
                <button type="button" disabled={i === 0} onClick={() => { const n = [...f.features]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; set("features", n); }} aria-label="Move up" className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
                <button type="button" disabled={i === f.features.length - 1} onClick={() => { const n = [...f.features]; [n[i + 1], n[i]] = [n[i], n[i + 1]]; set("features", n); }} aria-label="Move down" className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
                <button type="button" onClick={() => set("features", f.features.filter((_, j) => j !== i))} aria-label="Remove point" className="rounded-lg p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => set("features", [...f.features, ""])} className="flex items-center gap-2 rounded-xl border border-dashed border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-cyan-500/50 hover:text-white">
            <Plus className="h-4 w-4" aria-hidden="true" /> Add a point
          </button>
        </div>

        {/* Tools and people */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className={box}>
            <label htmlFor="p-tools" className="text-sm font-semibold text-white">Tools used</label>
            <Chips id="p-tools" items={f.tools} onChange={(v) => set("tools", v)} placeholder="e.g. Python, then Enter" />
          </div>
          <div className={box}>
            <label htmlFor="p-people" className="text-sm font-semibold text-white">Built by</label>
            <Chips id="p-people" items={f.contributors} onChange={(v) => set("contributors", v)} placeholder="Add a person, then Enter" />
          </div>
        </div>

        {/* Dates */}
        <div className={box}>
          <h3 className="text-sm font-semibold text-white">Dates</h3>
          <label className="flex items-center gap-3 text-sm text-slate-200">
            <input type="checkbox" checked={f.is_current} onChange={(e) => set("is_current", e.target.checked)} className="h-4 w-4 accent-cyan-500" />
            I&apos;m still working on this
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <fieldset>
              <legend className={label}>Started</legend>
              <div className="flex gap-2">
                <select aria-label="Start month" value={f.start_date.month} onChange={(e) => set("start_date", { ...f.start_date, month: e.target.value })} className={input}>{MONTHS.map((m) => <option key={m}>{m}</option>)}</select>
                <select aria-label="Start year" value={f.start_date.year} onChange={(e) => set("start_date", { ...f.start_date, year: e.target.value })} className={input}>{YEARS.map((y) => <option key={y}>{y}</option>)}</select>
              </div>
            </fieldset>
            {!f.is_current && (
              <fieldset>
                <legend className={label}>Ended</legend>
                <div className="flex gap-2">
                  <select aria-label="End month" value={f.end_date?.month ?? f.start_date.month} onChange={(e) => set("end_date", { year: f.end_date?.year ?? f.start_date.year, month: e.target.value })} className={input}>{MONTHS.map((m) => <option key={m}>{m}</option>)}</select>
                  <select aria-label="End year" value={f.end_date?.year ?? f.start_date.year} onChange={(e) => set("end_date", { month: f.end_date?.month ?? f.start_date.month, year: e.target.value })} className={input}>{YEARS.map((y) => <option key={y}>{y}</option>)}</select>
                </div>
              </fieldset>
            )}
          </div>
        </div>

        {/* Links */}
        <div className={box}>
          <h3 className="text-sm font-semibold text-white">Links <span className={hint}>(optional)</span></h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label htmlFor="p-url" className={label}>Code or live site</label>
              <input id="p-url" type="url" value={f.url} onChange={(e) => set("url", e.target.value)} className={input} placeholder="https://…" />
            </div>
            <div>
              <label htmlFor="p-video" className={label}>Video <span className={hint}>(YouTube, Vimeo, Loom)</span></label>
              <input id="p-video" type="url" value={f.video_url} onChange={(e) => set("video_url", e.target.value)} className={input} placeholder="https://…" />
            </div>
            <div>
              <label htmlFor="p-pdf" className={label}>Document (PDF)</label>
              <input id="p-pdf" value={f.pdf_url} onChange={(e) => set("pdf_url", e.target.value)} className={input} placeholder="https://… or /uploads/…" />
            </div>
          </div>
        </div>

        {/* Where it shows */}
        <div className={box}>
          <h3 className="text-sm font-semibold text-white">Where it shows</h3>
          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-3 text-sm text-slate-200">
              <input type="checkbox" checked={f.is_visible} onChange={(e) => set("is_visible", e.target.checked)} className="h-4 w-4 accent-emerald-500" />
              Show on the site <span className={hint}>(untick to hide without deleting)</span>
            </label>
            <label className="flex items-center gap-3 text-sm text-slate-200">
              <input type="checkbox" checked={f.featured} onChange={(e) => set("featured", e.target.checked)} className="h-4 w-4 accent-cyan-500" />
              Feature on the homepage
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              Position
              <input type="number" min={0} max={999} value={f.sort_order} onChange={(e) => set("sort_order", Number(e.target.value) || 0)} className="w-20 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-sm text-white" />
              <span className={hint}>(1 = first)</span>
            </label>
          </div>
        </div>

        <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-800 bg-slate-900 pt-4">
          <button type="button" onClick={onClose} className="rounded-xl px-5 py-2.5 text-sm text-slate-300 hover:bg-slate-800">Cancel</button>
          <button type="submit" disabled={saving || uploading} className="flex items-center gap-2 rounded-xl bg-cyan-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
            {isNew && !f.id ? "Publish project" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
