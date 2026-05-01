"use client";

import { useState } from "react";
import { Microscope, Save, X, Upload, Database } from "lucide-react";
import { upsertContent, uploadArtifact } from "@/domain/admin/actions";
import { syncResearchToKnowledge } from "@/domain/research/actions";
import { type ResearchPaper } from "@/domain/research/types";
import { toast } from "react-hot-toast";

interface ResearchFormData {
  id?: string;
  title: string;
  slug: string;
  abstract: string;
  pdf_url: string;
  tags: string[];
}

interface ResearchEditorProps {
  initialData?: Partial<ResearchFormData>;
  onClose: () => void;
}

export default function ResearchEditor({ initialData, onClose }: ResearchEditorProps) {
  const [isPending, setIsPending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState<ResearchFormData>({
    id: initialData?.id || undefined,
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    abstract: initialData?.abstract || "",
    pdf_url: initialData?.pdf_url || "",
    tags: Array.isArray(initialData?.tags) ? initialData.tags : [],
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    const result = await upsertContent({ table: 'research', payload: formData, path: '/research' });
    
    if (result.success) {
      toast.success("Research artifact published.");
      
      // Background Sync to Digital Twin
      toast.promise(
        syncResearchToKnowledge({
          ...formData,
          id: result.data.id,
          createdAt: new Date().toISOString(),
          views: 0,
          downloads: 0,
          pdfUrl: formData.pdf_url,
          tags: formData.tags
        } as ResearchPaper),
        {
          loading: 'Analyzing artifact architecture...',
          success: 'Knowledge Base Synchronized.',
          error: 'Sync incomplete (Local node only).'
        }
      );

      onClose();
    } else {
      const errorMsg = "error" in result ? (result.error as string) : (result as { message?: string }).message;
      toast.error("Sync Failure: " + errorMsg);
    }
    setIsPending(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
      <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-600/20 flex items-center justify-center border border-purple-500/30">
            <Microscope className="h-5 w-5 text-purple-400" />
          </div>
          <h2 className="text-xl font-bold text-white uppercase tracking-tighter">Research_Lab_Editor</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors"><X className="h-5 w-5 text-slate-500" /></button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Paper_Title</label>
          <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-')})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-purple-500 outline-none" />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Research_Abstract</label>
          <textarea required value={formData.abstract} onChange={e => setFormData({...formData, abstract: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-purple-500 outline-none min-h-[120px]" />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">PDF_Artifact</label>
          <div className="flex gap-4">
            <input readOnly value={formData.pdf_url} className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-500 font-mono" />
            <label className="bg-slate-800 hover:bg-slate-700 p-3 rounded-xl cursor-pointer border border-slate-700">
              <Upload className="h-5 w-5 text-purple-400" />
              <input type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} />
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-6 border-t border-slate-800">
          <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-white transition-colors">ABORT</button>
          <button type="submit" disabled={isPending || isUploading} className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-2.5 rounded-xl font-bold transition-all shadow-lg flex items-center gap-3 text-xs">
            {isPending ? <Database className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            PUBLISH_TO_NODE
          </button>
        </div>
      </form>
    </div>
  );
}
