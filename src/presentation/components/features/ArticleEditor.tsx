"use client";

import { useMemo, useState } from "react";
import { X, Save, Send, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { saveArticle } from "@/core/domain/admin/content-mutations";
import { blocksToMarkdown, slugify } from "@/infrastructure/utils/markdownBlocks";
import type { ContentBlock } from "@/core/domain/portfolio/types";

const CATEGORIES = ["Engineering", "Security", "Cloud", "AI", "Career"] as const;

/** Shape of an `articles` row as the admin list returns it. */
interface ArticleRow {
  id?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  body_content?: ContentBlock[];
  category?: string;
  tags?: string[];
  cover_image_url?: string | null;
  status?: string;
}

const input =
  "w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white focus:border-cyan-500 focus:outline-none";
const label = "mb-2 block text-sm font-medium text-slate-300";

export default function ArticleEditor({ initialData, onClose }: { initialData?: ArticleRow; onClose: () => void }) {
  const [form, setForm] = useState({
    id: initialData?.id,
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    excerpt: initialData?.excerpt || "",
    markdown: blocksToMarkdown(initialData?.body_content),
    category: (CATEGORIES as readonly string[]).includes(initialData?.category || "") ? initialData!.category! : "Engineering",
    tags: (initialData?.tags || []).join(", "),
    coverImageUrl: initialData?.cover_image_url || "",
  });
  const [pending, setPending] = useState<null | "DRAFT" | "PUBLISHED">(null);
  const isPublished = initialData?.status === "PUBLISHED";
  const slugPreview = useMemo(() => slugify(form.slug || form.title), [form.slug, form.title]);
  const words = form.markdown.trim() ? form.markdown.trim().split(/\s+/).length : 0;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (status: "DRAFT" | "PUBLISHED") => {
    setPending(status);
    const result = await saveArticle({
      ...form,
      category: form.category as (typeof CATEGORIES)[number],
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      status,
    });
    setPending(null);
    if (result.success) {
      toast.success(result.message);
      onClose();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
      <div className="mb-8 flex items-center justify-between border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-xl font-bold text-white">{form.id ? "Edit article" : "New article"}</h2>
          <p className="mt-1 text-xs text-slate-500">
            {isPublished ? "Published" : "Draft"} · {words} words · about {Math.max(1, Math.ceil(words / 200))} min read
          </p>
        </div>
        <button onClick={onClose} aria-label="Close editor" className="rounded-full p-2 transition-colors hover:bg-slate-800">
          <X className="h-5 w-5 text-slate-500" />
        </button>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); submit("PUBLISHED"); }} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-[1fr_200px]">
          <div>
            <label htmlFor="a-title" className={label}>Title</label>
            <input id="a-title" required maxLength={200} value={form.title} onChange={set("title")} className={input} />
            <p className="mt-1 text-xs text-slate-500">Link: /blog/{slugPreview || "…"}</p>
          </div>
          <div>
            <label htmlFor="a-cat" className={label}>Category</label>
            <select id="a-cat" value={form.category} onChange={set("category")} className={input}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="a-excerpt" className={label}>Summary <span className="text-slate-500">(shown on the blog list and in search results)</span></label>
          <textarea id="a-excerpt" required rows={2} maxLength={500} value={form.excerpt} onChange={set("excerpt")} className={input} />
        </div>

        <div>
          <label htmlFor="a-body" className={label}>Article <span className="text-slate-500">(Markdown: # Heading, **bold**, - list, [link](https://…), ```code```)</span></label>
          <textarea id="a-body" required value={form.markdown} onChange={set("markdown")} className={`${input} min-h-[320px] font-mono text-xs leading-relaxed`} />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="a-tags" className={label}>Tags <span className="text-slate-500">(comma separated, max 10)</span></label>
            <input id="a-tags" value={form.tags} onChange={set("tags")} className={input} placeholder="nextjs, security" />
          </div>
          <div>
            <label htmlFor="a-cover" className={label}>Cover image URL <span className="text-slate-500">(optional)</span></label>
            <input id="a-cover" type="url" value={form.coverImageUrl} onChange={set("coverImageUrl")} className={input} placeholder="https://…" />
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-slate-800 pt-6">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-slate-400 hover:text-white">
            Cancel
          </button>
          <button
            type="button"
            disabled={pending !== null}
            onClick={() => submit("DRAFT")}
            className="flex items-center gap-2 rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 disabled:opacity-50"
          >
            {pending === "DRAFT" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isPublished ? "Unpublish (save as draft)" : "Save draft"}
          </button>
          <button
            type="submit"
            disabled={pending !== null}
            className="flex items-center gap-2 rounded-xl bg-cyan-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-50"
          >
            {pending === "PUBLISHED" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {isPublished ? "Update" : "Publish"}
          </button>
        </div>
      </form>
    </div>
  );
}
