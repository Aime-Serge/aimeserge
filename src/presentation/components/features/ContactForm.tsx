"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { submitContactForm } from "@/core/domain/interactions/mutations";
import { CONTACT_INTERESTS, type ContactSubmission } from "@/core/domain/interactions/types";

const EMPTY: ContactSubmission = {
  name: "",
  email: "",
  contactType: "Individual",
  companyName: "",
  interest: "Hiring",
  linkedinUrl: "",
  message: "",
  newsletterOptIn: false,
  website: "",
};

const inputClass =
  "w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/40";
const labelClass = "mb-2 block text-sm font-medium text-slate-300";

/** `initialInterest` comes from links like /contact?topic=Hiring (homepage "work with me" cards). */
export default function ContactForm({ initialInterest }: { initialInterest?: string }) {
  const startInterest =
    initialInterest && (CONTACT_INTERESTS as readonly string[]).includes(initialInterest) ? initialInterest : EMPTY.interest;
  const [form, setForm] = useState<ContactSubmission>({ ...EMPTY, interest: startInterest });
  const [isPending, setIsPending] = useState(false);

  const update = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const next = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setForm((prev) => ({ ...prev, [name]: next }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    try {
      const payload = form.contactType === "Individual" ? { ...form, companyName: "" } : form;
      const result = await submitContactForm(payload);
      if (result.success) {
        toast.success(result.message);
        setForm(EMPTY);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setIsPending(false);
    }
  };

  const isBusiness = form.contactType !== "Individual";

  return (
    <form
      onSubmit={onSubmit}
      className="relative space-y-6 rounded-3xl border border-slate-800 bg-slate-950/50 p-6 md:p-10"
      noValidate={false}
    >
      {/* Honeypot: hidden from people and screen readers, bots tend to fill it. */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={update} />
      </div>

      <fieldset>
        <legend className={labelClass}>I&apos;m writing as</legend>
        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-800 bg-slate-900/80 p-1.5">
          {(["Individual", "Business"] as const).map((type) => (
            <label
              key={type}
              className={`cursor-pointer rounded-xl py-2.5 text-center text-sm font-semibold transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-cyan-500 ${
                form.contactType === type ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <input
                type="radio"
                name="contactType"
                value={type}
                checked={form.contactType === type}
                onChange={update}
                className="sr-only"
              />
              {type === "Individual" ? "An individual" : "An organisation"}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>Your name</label>
          <input id="name" name="name" required minLength={2} maxLength={100} autoComplete="name" value={form.name} onChange={update} className={inputClass} />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>Email</label>
          <input id="email" name="email" type="email" required maxLength={200} autoComplete="email" value={form.email} onChange={update} className={inputClass} placeholder="you@example.com" />
        </div>
        {isBusiness && (
          <div>
            <label htmlFor="companyName" className={labelClass}>Organisation or company <span className="text-slate-500">(optional)</span></label>
            <input id="companyName" name="companyName" maxLength={150} autoComplete="organization" value={form.companyName} onChange={update} className={inputClass} />
          </div>
        )}
        <div>
          <label htmlFor="interest" className={labelClass}>What is it about?</label>
          <select id="interest" name="interest" value={form.interest} onChange={update} className={inputClass}>
            {CONTACT_INTERESTS.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>
        <div className={isBusiness ? "md:col-span-2" : ""}>
          <label htmlFor="linkedinUrl" className={labelClass}>LinkedIn <span className="text-slate-500">(optional)</span></label>
          <input id="linkedinUrl" name="linkedinUrl" type="url" maxLength={300} value={form.linkedinUrl} onChange={update} className={inputClass} placeholder="https://linkedin.com/in/…" />
        </div>
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>Message</label>
        <textarea
          id="message"
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={6}
          value={form.message}
          onChange={update}
          className={inputClass}
          placeholder="A few lines about the role, project, partnership or research idea, and your timeline."
        />
      </div>

      <label className="flex items-start gap-3 text-sm text-slate-400">
        <input
          type="checkbox"
          name="newsletterOptIn"
          checked={form.newsletterOptIn}
          onChange={update}
          className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-900 accent-cyan-600"
        />
        Email me when I publish a new article (about once a month, unsubscribe any time).
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-cyan-600 py-4 font-bold text-white transition hover:bg-cyan-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:opacity-50"
      >
        {isPending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
