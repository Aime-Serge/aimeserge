"use client";

import { useState } from "react";
import { Microscope, Save, X, Upload, Database, Plus, Trash2, Link as LinkIcon } from "lucide-react";
import { upsertContent, uploadArtifact } from "@/core/domain/admin/actions";
import { syncResearchToKnowledge } from "@/core/domain/research/actions";
import { type ResearchPaper, type ResearchAuthor, type ResearchSection } from "@/core/domain/research/types";
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
}

interface ResearchEditorProps {
  initialData?: Partial<ResearchPaper>;
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
    pdf_url: initialData?.pdfUrl || "",
    tags: initialData?.tags || [],
    doi: initialData?.doi || "",
    authors: initialData?.authors || [{ name: "", affiliation: "" }],
    funding: initialData?.funding || "",
    publication_date: initialData?.publicationDate || new Date().toISOString().split('T')[0],
    content: initialData?.content || [
      { id: 'intro', title: 'Introduction', content: '', order: 1 },
      { id: 'methods', title: 'Methods', content: '', order: 2 },
      { id: 'results', title: 'Results', content: '', order: 3 },
      { id: 'discussion', title: 'Discussion', content: '', order: 4 },
    ],
    category: initialData?.category || "Security",
    language: initialData?.language || "en",
  });

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

  const updateSection = (index: number, content: string) => {
    const newContent = [...formData.content];
    newContent[index] = { ...newContent[index], content };
    setFormData({ ...formData, content: newContent });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    
    // Convert to DB payload
    const payload = {
      ...formData,
      tags: Array.isArray(formData.tags) ? formData.tags : [],
      authors: formData.authors,
      content: formData.content,
    };

    const result = await upsertContent({ table: 'research', payload, path: '/research' });
    
    if (result.success) {
      toast.success("Research artifact published.");
      
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
      toast.error("Sync Failure: " + errorMsg);
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
          <h2 className="text-xl font-bold text-white uppercase tracking-tighter">Research_Protocol_v2</h2>
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
            {tab}_Layer
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {activeTab === 'identity' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Project_Title</label>
                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-')})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">DOI_Identifier</label>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                  <input placeholder="10.1000/xyz123" value={formData.doi} onChange={e => setFormData({...formData, doi: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:border-emerald-500 outline-none font-mono" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Authors_Registry</label>
                <button type="button" onClick={addAuthor} className="text-[10px] font-bold text-emerald-500 flex items-center gap-1 hover:text-emerald-400">
                  <Plus className="h-3 w-3" /> ADD_CONTRIBUTOR
                </button>
              </div>
              <div className="space-y-3">
                {formData.authors.map((author, index) => (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <input placeholder="Name" value={author.name} onChange={e => updateAuthor(index, 'name', e.target.value)} className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500" />
                    <input placeholder="ORCID" value={author.orcid} onChange={e => updateAuthor(index, 'orcid', e.target.value)} className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 font-mono" />
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
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Executive_Abstract</label>
              <textarea required value={formData.abstract} onChange={e => setFormData({...formData, abstract: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none min-h-[120px]" />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Funding_&_Grants</label>
                <input value={formData.funding} onChange={e => setFormData({...formData, funding: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Publication_Date</label>
                <input type="date" value={formData.publication_date} onChange={e => setFormData({...formData, publication_date: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'structure' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 mb-6">
              <p className="text-[10px] text-emerald-400 font-mono">SYSTEM_NOTE: Following IMRaD standards. Markdown & LaTeX supported.</p>
            </div>
            {formData.content.map((section, index) => (
              <div key={section.id} className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">{section.title}</label>
                <textarea 
                  value={section.content} 
                  onChange={e => updateSection(index, e.target.value)} 
                  placeholder={`Detailed ${section.title.toLowerCase()}...`}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none min-h-[150px] font-mono" 
                />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'discovery' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Research_Artifact (PDF)</label>
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
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Taxonomy_Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none">
                  <option value="Security">Cyber Security</option>
                  <option value="AI">Artificial Intelligence</option>
                  <option value="Cloud">Cloud Architecture</option>
                  <option value="Engineering">Software Engineering</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Language_ISO</label>
                <input value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})} placeholder="en, fr, etc." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none font-mono" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Keywords (Comma Separated)</label>
              <input 
                value={formData.tags.join(', ')} 
                onChange={e => setFormData({...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t !== "")})} 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none" 
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-4 pt-6 border-t border-slate-800 sticky bottom-0 bg-slate-900 z-10">
          <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-white transition-colors">ABORT_MISSION</button>
          <button type="submit" disabled={isPending || isUploading} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20 flex items-center gap-3 text-xs">
            {isPending ? <Database className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            COMMIT_TO_LEDGER
          </button>
        </div>
      </form>
    </div>
  );
}
