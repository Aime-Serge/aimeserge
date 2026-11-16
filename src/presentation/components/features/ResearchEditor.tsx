"use client";

import { useState } from "react";
import { Microscope, Save, X, Upload, Database, Plus, Trash2, Link as LinkIcon } from "lucide-react";
import { upsertContent, uploadArtifact } from "@/core/domain/admin/mutations";
import { syncResearchToKnowledge } from "@/core/domain/research/mutations";
import { RESEARCH_STATUS_LABEL, type ResearchPaper, type ResearchAuthor, type ResearchSection, type ResearchStatus } from "@/core/domain/research/types";
import { toast } from "react-hot-toast";

interface ResearchFormData {
  id?: string;
  title: string;
  slug: string;
  abstract: string;
  pdf_url: string;
  tags: string[];
  doi?: string;
  authors: ResearchAuthor[];
  funding?: string;
  publication_date?: string;
  content: ResearchSection[];
  category?: string;
  language: string;
  status: ResearchStatus;
}

interface ResearchEditorProps {
  // Rows from the admin list use database names (pdf_url); papers use pdfUrl. Accept both.
  initialData?: Partial<ResearchPaper> & { pdf_url?: string | null; publication_date?: string | null };
  onClose: () => void;
}

export default function ResearchEditor({ initialData, onClose }: ResearchEditorProps) {
  const [isPending, setIsPending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'identity' | 'structure' | 'discovery'>('identity');
  
  const [formData, setFormData] = useState<ResearchFormData>({
    id: initialData?.id || undefined,
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    abstract: initialData?.abstract || "",
    pdf_url: initialData?.pdfUrl || initialData?.pdf_url || "",
    tags: initialData?.tags || [],
    doi: initialData?.doi || "",
    authors: initialData?.authors || [{ name: "", affiliation: "" }],
    funding: initialData?.funding || "",
    publication_date: (initialData?.publicationDate || initialData?.publication_date || new Date().toISOString()).slice(0, 10),
    content: initialData?.content || [
      { id: 'intro', title: 'Introduction', content: '', order: 1 },
      { id: 'methods', title: 'Methods', content: '', order: 2 },
      { id: 'results', title: 'Results', content: '', order: 3 },
      { id: 'discussion', title: 'Discussion', content: '', order: 4 },
    ],
    category: initialData?.category || "",
    language: initialData?.language || "en",
    status: (initialData?.status as ResearchStatus) || "published",
  });

  // Raw text so commas can be typed; parsed into tags on every change.
  const [tagsText, setTagsText] = useState(() => (initialData?.tags || []).join(", "));

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const result = await uploadArtifact({ file, path: "research" });
    if (result.success) {
      setFormData({ ...formData, pdf_url: result.url as string });
      toast.success("Research paper uploaded.");
    } else {
      const errorMsg = "error" in result ? (result.error as string) : (result as { message?: string }).message;
      toast.error("Upload failed: " + errorMsg);
    }
    setIsUploading(false);
  };

  const addAuthor = () => setFormData({ ...formData, authors: [...formData.authors, { name: "" }] });
  const removeAuthor = (index: number) => setFormData({ ...formData, authors: formData.authors.filter((_, i) => i !== index) });
  
  const updateAuthor = (index: number, field: keyof ResearchAuthor, value: string) => {
    const newAuthors = [...formData.authors];
    newAuthors[index] = { ...newAuthors[index], [field]: value };
    setFormData({ ...formData, authors: newAuthors });
  };

  const updateSection = (index: number, patch: Partial<ResearchSection>) => {
    const newContent = [...formData.content];
    newContent[index] = { ...newContent[index], ...patch };
    setFormData({ ...formData, content: newContent });
  };
  const addSection = () =>
    setFormData({ ...formData, content: [...formData.content, { id: `section-${Date.now()}`, title: "New section", content: "", order: formData.content.length + 1 }] });
  const removeSection = (index: number) =>
    setFormData({ ...formData, content: formData.content.filter((_, i) => i !== index) });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    
    // Convert to DB payload
    const payload = {
      ...formData,
      pdf_url: formData.pdf_url.trim() || null,
      tags: Array.isArray(formData.tags) ? formData.tags : [],
      authors: formData.authors.filter((a) => a.name.trim()),
      // Empty sections are left out, so they don't show as blank boxes.
      content: formData.content.filter((c) => c.content.trim()).map((c, i) => ({ ...c, order: i + 1 })),
    };

    const result = await upsertContent({ table: 'research', payload, path: '/research' });
    
    if (result.success) {
      toast.success("Research saved. The research page updates within seconds.");
      
      // Background Sync
      syncResearchToKnowledge({
        ...formData,
        id: result.data.id,
        createdAt: new Date().toISOString(),
        views: 0,
        downloads: 0,
        pdfUrl: formData.pdf_url,
        tags: formData.tags,
        publicationDate: formData.publication_date || "",
        citations: 0,
        assets: [],
      } as ResearchPaper);

      onClose();
    } else {
      const errorMsg = "error" in result ? (result.error as string) : (result as { message?: string }).message;
      toast.error("Couldn't save: " + errorMsg);
    }
    setIsPending(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-300 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-6 sticky top-0 bg-slate-900 z-10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-600/20 flex items-center justify-center border border-emerald-500/30">
            <Microscope className="h-5 w-5 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-white uppercase tracking-tighter">{formData.id ? "Edit research" : "New research"}</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors"><X className="h-5 w-5 text-slate-500" /></button>
      </div>

      <div className="flex gap-4 mb-8">
        {(['identity', 'structure', 'discovery'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            {({ identity: "1. About", structure: "2. Sections", discovery: "3. File & keywords" } as const)[tab]}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {activeTab === 'identity' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Title *</label>
                <input required value={formData.title} onChange={e => { const title = e.target.value; setFormData({...formData, title, slug: formData.id ? formData.slug : title.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80)}); }} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">DOI <span className="font-normal text-slate-500">(if published)</span></label>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                  <input placeholder="10.1000/xyz123" value={formData.doi} onChange={e => setFormData({...formData, doi: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:border-emerald-500 outline-none font-mono" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Authors</label>
                <button type="button" onClick={addAuthor} className="text-[10px] font-bold text-emerald-500 flex items-center gap-1 hover:text-emerald-400">
                  <Plus className="h-3 w-3" /> Add author
                </button>
              </div>
              <div className="space-y-3">
                {formData.authors.map((author, index) => (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <input placeholder="Name" value={author.name} onChange={e => updateAuthor(index, 'name', e.target.value)} className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500" />
                    <input placeholder="ORCID (optional)" value={author.orcid} onChange={e => updateAuthor(index, 'orcid', e.target.value)} className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 font-mono" />
                    <div className="flex gap-2">
                      <input placeholder="Affiliation" value={author.affiliation} onChange={e => updateAuthor(index, 'affiliation', e.target.value)} className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500" />
                      {formData.authors.length > 1 && (
                        <button type="button" onClick={() => removeAuthor(index)} className="p-2 text-slate-600 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Summary (abstract) *</label>
              <textarea required value={formData.abstract} onChange={e => setFormData({...formData, abstract: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none min-h-[120px]" />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Funding <span className="font-normal text-slate-500">(optional)</span></label>
                <input value={formData.funding} onChange={e => setFormData({...formData, funding: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Date</label>
                <input type="date" value={formData.publication_date} onChange={e => setFormData({...formData, publication_date: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'structure' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 mb-6">
              <p className="text-[10px] text-emerald-400 font-mono">Write each section in plain language. Leave a section empty to hide it. Markdown is supported.</p>
            </div>
            {formData.content.map((section, index) => (
              <div key={section.id} className="space-y-2 rounded-2xl border border-slate-800 p-4">
                <div className="flex gap-2">
                  <input
                    aria-label="Section title"
                    value={section.title}
                    onChange={e => updateSection(index, { title: e.target.value })}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-semibold text-white focus:border-emerald-500 outline-none"
                  />
                  <button type="button" onClick={() => removeSection(index)} aria-label={`Remove section ${section.title}`} className="rounded-lg p-2 text-slate-500 hover:bg-red-500/10 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                </div>
                <textarea
                  aria-label={`${section.title} text`}
                  value={section.content}
                  onChange={e => updateSection(index, { content: e.target.value })}
                  placeholder={`Write the ${section.title.toLowerCase()} in plain language…`}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none min-h-[150px]"
                />
              </div>
            ))}
            <button type="button" onClick={addSection} className="flex items-center gap-2 rounded-xl border border-dashed border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-emerald-500/50 hover:text-white">
              <Plus className="h-4 w-4" /> Add section
            </button>
          </div>
        )}

        {activeTab === 'discovery' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Paper or report (PDF)</label>
              <div className="flex gap-4">
                <input readOnly value={formData.pdf_url} className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-500 font-mono" />
                <label className="bg-slate-800 hover:bg-slate-700 p-3 rounded-xl cursor-pointer border border-slate-700">
                  <Upload className="h-5 w-5 text-emerald-400" />
                  <input type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} />
                </label>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Category</label>
                <input list="research-category-suggestions" maxLength={60} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="e.g. Climate" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none" />
                <datalist id="research-category-suggestions">
                  {["Climate", "Health", "Small business", "Security", "AI", "Cloud", "Engineering"].map((c) => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div className="space-y-2">
                <label htmlFor="r-status" className="text-sm font-medium text-slate-300 ml-1">Status</label>
                <select id="r-status" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as ResearchStatus})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none">
                  {(Object.keys(RESEARCH_STATUS_LABEL) as ResearchStatus[]).map((k) => <option key={k} value={k}>{RESEARCH_STATUS_LABEL[k]}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Language</label>
                <input value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})} placeholder="en, fr or rw" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none font-mono" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Keywords <span className="font-normal text-slate-500">(separate with commas)</span></label>
              <input 
                value={tagsText}
                onChange={e => { setTagsText(e.target.value); setFormData({...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t !== "")}); }}
                placeholder="e.g. climate, East Africa, rainfall"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none" 
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-4 pt-6 border-t border-slate-800 sticky bottom-0 bg-slate-900 z-10">
          <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-white transition-colors">Cancel</button>
          <button type="submit" disabled={isPending || isUploading} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20 flex items-center gap-3 text-xs">
            {isPending ? <Database className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save research
          </button>
        </div>
      </form>
    </div>
  );
}
