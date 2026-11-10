"use client";

import { useState } from "react";
import { FileUp, Loader2, Check } from "lucide-react";
import { toast } from "react-hot-toast";
import { applyCvImport } from "@/core/domain/admin/cv-mutations";
import { CV_SECTIONS, type CvData, type CvSection } from "@/core/domain/admin/cv-schema";

const LABELS: Record<CvSection, string> = {
  experiences: "Experience",
  educations: "Education",
  certificates: "Certificates",
  achievements: "Achievements",
};

const when = (a?: string | null, b?: string | null) => `${a ?? ""}${a ? " – " : ""}${b === null ? "now" : b ?? ""}`;

function rows(section: CvSection, d: CvData): { main: string; sub: string; note?: string }[] {
  switch (section) {
    case "experiences": return d.experiences.map((e) => ({ main: `${e.title} · ${e.organization}`, sub: when(e.startDate, e.endDate ?? null), note: e.description }));
    case "educations": return d.educations.map((e) => ({ main: `${e.degree} · ${e.institution}`, sub: when(e.startDate, e.endDate), note: e.description }));
    case "certificates": return d.certificates.map((c) => ({ main: `${c.name} · ${c.provider}`, sub: c.issueDate, note: c.description }));
    case "achievements": return d.achievements.map((a) => ({ main: a.title, sub: [a.issuer, a.date].filter(Boolean).join(" · ") }));
  }
}

/** Upload a new CV, check what was read, then update the Resume page in one click. */
export default function CvImporter() {
  const [file, setFile] = useState<File | null>(null);
  const [reading, setReading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [draft, setDraft] = useState<CvData | null>(null);
  const [cvUrl, setCvUrl] = useState<string | null>(null);
  const [chosen, setChosen] = useState<CvSection[]>([...CV_SECTIONS]);

  const read = async () => {
    if (!file) return;
    setReading(true);
    setDraft(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/v1/admin/cv-import", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Couldn't read the CV.");
      setDraft(json.draft);
      setCvUrl(json.cvUrl);
      toast.success("CV read. Check the preview, then apply.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't read the CV.");
    } finally {
      setReading(false);
    }
  };

  const apply = async () => {
    if (!draft) return;
    if (!confirm(`Replace ${chosen.map((s) => LABELS[s]).join(", ")} on the website with this CV?`)) return;
    setApplying(true);
    const r = await applyCvImport({ draft, sections: chosen, cvUrl });
    setApplying(false);
    if (r.success) { toast.success(r.message); setDraft(null); setFile(null); }
    else toast.error(r.message);
  };

  const toggle = (s: CvSection) => setChosen((c) => (c.includes(s) ? c.filter((x) => x !== s) : [...c, s]));

  return (
    <section className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/40 p-8">
      <div>
        <h2 className="text-xl font-bold text-white">Update from CV</h2>
        <p className="mt-1 text-sm text-slate-500">
          Upload your latest CV (PDF). The AI reads it into Experience, Education, Certificates and Achievements, and the
          Download CV button will point to it. Nothing changes until you check the preview and press Apply.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex-1">
          <span className="sr-only">CV PDF</span>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-800 file:px-4 file:py-2 file:text-sm file:text-white"
          />
        </label>
        <button type="button" onClick={read} disabled={!file || reading} className="flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-6 py-3 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-50">
          {reading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
          {reading ? "Reading… (up to a minute)" : "Read CV"}
        </button>
      </div>

      {draft && (
        <div className="space-y-6">
          {CV_SECTIONS.map((s) => {
            const list = rows(s, draft);
            return (
              <div key={s} className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                <label className="flex items-center gap-3 text-sm font-semibold text-white">
                  <input type="checkbox" checked={chosen.includes(s)} onChange={() => toggle(s)} className="h-4 w-4 accent-cyan-500" />
                  {LABELS[s]} <span className="font-normal text-slate-500">({list.length})</span>
                </label>
                <ul className="mt-4 space-y-3">
                  {list.map((r, i) => (
                    <li key={i} className="text-sm">
                      <p className="text-slate-200">{r.main} <span className="text-slate-500">{r.sub}</span></p>
                      {r.note && <p className="mt-1 text-slate-400">{r.note}</p>}
                    </li>
                  ))}
                  {!list.length && <li className="text-sm text-slate-500">Nothing found. Untick this to keep what the site has.</li>}
                </ul>
              </div>
            );
          })}
          <div className="flex justify-end">
            <button type="button" onClick={apply} disabled={applying || !chosen.length} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50">
              {applying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Apply to website
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
