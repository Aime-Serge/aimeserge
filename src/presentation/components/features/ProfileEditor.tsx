"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "react-hot-toast";
import { getProfileForAdmin, saveProfile, type ProfileInput } from "@/core/domain/admin/content-mutations";

const input =
  "w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white focus:border-cyan-500 focus:outline-none";
const label = "mb-2 block text-sm font-medium text-slate-300";

/** Edits the homepage hero, availability badge and CV link. */
export default function ProfileEditor() {
  const [form, setForm] = useState<ProfileInput | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getProfileForAdmin().then((r) => {
      if (r.success && r.data) setForm(r.data);
      else toast.error(r.message);
    });
  }, []);

  if (!form) return <p className="p-12 text-center text-sm text-slate-500">Loading profile…</p>;

  const set = (k: keyof ProfileInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const r = await saveProfile(form);
    setSaving(false);
    if (r.success) toast.success(r.message);
    else toast.error(r.message);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/40 p-8">
      <div>
        <h2 className="text-xl font-bold text-white">Profile</h2>
        <p className="mt-1 text-sm text-slate-500">This text appears at the top of the homepage. Changes go live as soon as you save.</p>
      </div>

      <div>
        <label htmlFor="p-headline" className={label}>Headline</label>
        <input id="p-headline" required maxLength={160} value={form.headline} onChange={set("headline")} className={input} />
      </div>
      <div>
        <label htmlFor="p-bio" className={label}>Short intro <span className="text-slate-500">(2–3 sentences)</span></label>
        <textarea id="p-bio" required rows={3} maxLength={600} value={form.bio} onChange={set("bio")} className={input} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="p-location" className={label}>Location</label>
          <input id="p-location" maxLength={100} value={form.location} onChange={set("location")} className={input} />
        </div>
        <div>
          <label htmlFor="p-cv" className={label}>CV link <span className="text-slate-500">(/uploads/… or https://…)</span></label>
          <input id="p-cv" maxLength={500} value={form.cvUrl} onChange={set("cvUrl")} className={input} />
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950 p-5">
        <label className="flex items-center gap-3 text-sm font-medium text-slate-200">
          <input type="checkbox" checked={Boolean(form.openToWork)} onChange={set("openToWork")} className="h-4 w-4 accent-emerald-500" />
          Show an &quot;open to work&quot; badge on the homepage
        </label>
        <input
          aria-label="Availability note"
          maxLength={120}
          value={form.availabilityNote}
          onChange={set("availabilityNote")}
          className={input}
          placeholder="e.g. Open to full-time roles and freelance projects"
        />
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-xl bg-cyan-600 px-6 py-3 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save profile
        </button>
      </div>
    </form>
  );
}
