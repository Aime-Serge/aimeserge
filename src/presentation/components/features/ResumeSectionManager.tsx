"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Trash2, Loader2, X, Save } from "lucide-react";
import { toast } from "react-hot-toast";
import { listResumeEntries, saveResumeEntry, type ResumeRow, type ResumeTable } from "@/core/domain/admin/site-mutations";
import { deleteContent } from "@/core/domain/admin/mutations";

type Field = {
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
  type?: "text" | "month" | "textarea" | "select" | "url";
  options?: Array<[string, string]>;
  wide?: boolean;
};

const EMPLOYMENT: Array<[string, string]> = [
  ["FULL_TIME", "Full-time"], ["PART_TIME", "Part-time"], ["CONTRACT", "Contract"],
  ["INTERNSHIP", "Internship"], ["FREELANCE", "Freelance"], ["VOLUNTEER", "Volunteer"],
];

const CONFIG: Record<ResumeTable, { noun: string; intro: string; fields: Field[]; empty: Record<string, string> }> = {
  experiences: {
    noun: "role",
    intro: "Jobs, ventures and volunteering on the resume page and homepage. Leave the end date empty for a current role.",
    fields: [
      { name: "title", label: "Role", required: true },
      { name: "organization", label: "Organisation", required: true, hint: "Created automatically if it's new" },
      { name: "employmentType", label: "Type", type: "select", options: EMPLOYMENT },
      { name: "location", label: "Location" },
      { name: "startDate", label: "Start", type: "month", required: true },
      { name: "endDate", label: "End", type: "month", hint: "Empty = current" },
      { name: "description", label: "What you did", type: "textarea", wide: true, hint: "Plain language. Only numbers you can prove." },
    ],
    empty: { title: "", organization: "", employmentType: "FULL_TIME", location: "Kigali, Rwanda", startDate: "", endDate: "", description: "" },
  },
  educations: {
    noun: "education entry",
    intro: "Schools and programmes on the resume page.",
    fields: [
      { name: "degree", label: "Qualification", required: true },
      { name: "institution", label: "School or programme", required: true, hint: "Created automatically if it's new" },
      { name: "fieldOfStudy", label: "Field of study" },
      { name: "grade", label: "Grade" },
      { name: "startDate", label: "Start", type: "month" },
      { name: "endDate", label: "End", type: "month" },
      { name: "description", label: "Details", type: "textarea", wide: true },
    ],
    empty: { degree: "", institution: "", fieldOfStudy: "", grade: "", startDate: "", endDate: "", description: "" },
  },
  achievements: {
    noun: "award",
    intro: "Prizes and recognition on the resume page.",
    fields: [
      { name: "title", label: "What you achieved", required: true, wide: true, hint: "e.g. 2nd place, Hacktoberfest Hack Day Kigali 2026" },
      { name: "issuer", label: "Given by" },
      { name: "date", label: "Date", hint: "e.g. 2026 or 2026-10" },
      { name: "url", label: "Proof link", type: "url", wide: true, hint: "Post, certificate or article (optional)" },
      { name: "description", label: "Details", type: "textarea", wide: true },
    ],
    empty: { title: "", issuer: "", date: "", url: "", description: "" },
  },
};

const input =
  "w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none";

/** List, add, edit and delete one resume section. */
export default function ResumeSectionManager({ table, createSignal }: { table: ResumeTable; createSignal: number }) {
  const cfg = CONFIG[table];
  const [rows, setRows] = useState<ResumeRow[] | null>(null);
  const [form, setForm] = useState<Record<string, string> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setRows(null);
    const r = await listResumeEntries(table);
    if (r.success) setRows(r.data ?? []);
    else {
      toast.error(r.message);
      setRows([]);
    }
  }, [table]);

  useEffect(() => {
    void load();
    setForm(null);
  }, [load]);

  // The page header's "New" button.
  useEffect(() => {
    if (createSignal) setForm({ ...cfg.empty });
  }, [createSignal, cfg.empty]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    const values = Object.fromEntries(Object.entries(form).filter(([k, v]) => !(k === "id" && !v)));
    const r = await saveResumeEntry({ table, values } as Parameters<typeof saveResumeEntry>[0]);
    setSaving(false);
    if (r.success) {
      toast.success(r.message);
      setForm(null);
      void load();
    } else toast.error(r.message);
  };

  const remove = async (row: ResumeRow) => {
    if (!confirm(`Delete “${row.title}”? It will disappear from the public site.`)) return;
    const r = await deleteContent({ table, id: row.id, path: "/resume" });
    if (r.success) {
      toast.success("Deleted.");
      setRows((prev) => prev?.filter((x) => x.id !== row.id) ?? null);
    } else toast.error("Couldn't delete. Try again.");
  };

  return (
    <div className="space-y-6">
      {form && (
        <form onSubmit={save} className="space-y-5 rounded-3xl border border-cyan-500/30 bg-slate-900/60 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">{form.id ? `Edit ${cfg.noun}` : `New ${cfg.noun}`}</h3>
            <button type="button" onClick={() => setForm(null)} aria-label="Close" className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {cfg.fields.map((f) => {
              const id = `${table}-${f.name}`;
              const value = form[f.name] ?? "";
              const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
                setForm({ ...form, [f.name]: e.target.value });
              return (
                <div key={f.name} className={f.wide ? "md:col-span-2" : undefined}>
                  <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-300">
                    {f.label} {f.required && <span className="text-red-400" aria-hidden="true">*</span>}
                    {f.hint && <span className="ml-1 font-normal text-slate-500">({f.hint})</span>}
                  </label>
                  {f.type === "textarea" ? (
                    <textarea id={id} rows={4} value={value} onChange={onChange} className={input} />
                  ) : f.type === "select" ? (
                    <select id={id} value={value} onChange={onChange} className={input}>
                      {f.options?.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  ) : (
                    <input id={id} type={f.type === "month" ? "month" : f.type === "url" ? "url" : "text"} required={f.required} value={value} onChange={onChange} className={input} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setForm(null)} className="rounded-xl px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">Cancel</button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2 text-sm font-medium text-white hover:bg-cyan-500 disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
              Save
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/40">
        {rows === null ? (
          <p className="p-10 text-center text-sm text-slate-500">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="p-10 text-center text-sm text-slate-500">
            Nothing here yet, so the public page shows the built-in list. Add the first {cfg.noun} to manage it here, or import your CV from the Profile tab.
          </p>
        ) : (
          <ul className="divide-y divide-slate-800">
            {rows.map((row) => (
              <li key={row.id} className="flex items-center gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{row.title}</p>
                  <p className="truncate text-xs text-slate-400">
                    {[row.subtitle, row.when].filter(Boolean).join(" · ")}
                    {row.current && <span className="ml-2 rounded bg-emerald-500/10 px-1.5 py-0.5 text-emerald-300">current</span>}
                  </p>
                </div>
                <button onClick={() => setForm({ ...row.form })} aria-label={`Edit ${row.title}`} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-cyan-400">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => remove(row)} aria-label={`Delete ${row.title}`} className="rounded-lg p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400">
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
