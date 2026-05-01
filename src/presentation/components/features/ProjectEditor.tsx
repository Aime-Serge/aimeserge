"use client";

import { useState } from "react";
import { Plus, Trash2, Save, X, Database, Cpu } from "lucide-react";
import { upsertContent } from "@/domain/admin/actions";
import { toast } from "react-hot-toast";

type ProjectCategory = "AI" | "Security" | "Cloud" | "Software Engineering" | "Full-Stack";

interface ProjectFormData {
  id?: string;
  title: string;
  slug: string;
  tagline: string;
  role: string;
  category: ProjectCategory;
  summary: string;
  description: string;
  tools: string[];
  features: string[];
  url: string;
  pdf_url: string;
}

interface ProjectEditorProps {
  initialData?: Partial<ProjectFormData>;
  onClose: () => void;
}

export default function ProjectEditor({ initialData, onClose }: ProjectEditorProps) {
  const [isPending, setIsPending] = useState(false);
  const [formData, setFormData] = useState<ProjectFormData>({
    id: initialData?.id || undefined,
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    tagline: initialData?.tagline || "",
    role: initialData?.role || "",
    category: initialData?.category || "Software Engineering",
    summary: initialData?.summary || "",
    description: initialData?.description || "",
    tools: Array.isArray(initialData?.tools) ? initialData.tools : [],
    features: Array.isArray(initialData?.features) ? initialData.features : [],
    url: initialData?.url || "",
    pdf_url: initialData?.pdf_url || "",
  });

  const [newTool, setNewTool] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    
    const result = await upsertContent({ table: 'projects', payload: formData, path: '/projects' });
    
    if (result.success) {
      toast.success("Project artifact synchronized successfully.");
      onClose();
    } else {
      const errorMsg = "error" in result ? (result.error as string) : (result as { message?: string }).message;
      toast.error(`Sync Failure: ${errorMsg}`);
    }
    setIsPending(false);
  };

  const addTool = () => {
    if (newTool && !formData.tools.includes(newTool)) {
      setFormData({ ...formData, tools: [...formData.tools, newTool] });
      setNewTool("");
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
      <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-cyan-600/20 flex items-center justify-center border border-cyan-500/30">
            <Database className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white uppercase tracking-tighter">Project_Editor_v1.0</h2>
            <p className="text-[10px] text-slate-500 font-mono">ID: {formData.id || 'NEW_RECORD'}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
          <X className="h-5 w-5 text-slate-500" />
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Title & Slug */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Artifact_Title</label>
            <input 
              required
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-')})}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500 outline-none transition-all"
              placeholder="e.g. Kigali Transport Optimization"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">System_Slug</label>
            <input 
              required
              value={formData.slug}
              onChange={e => setFormData({...formData, slug: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-400 font-mono focus:border-cyan-500 outline-none"
            />
          </div>

          {/* Tagline & Role */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Marketing_Tagline</label>
            <input 
              required
              value={formData.tagline}
              onChange={e => setFormData({...formData, tagline: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500 outline-none"
              placeholder="The 'hook' for this project"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Engineering_Role</label>
            <input 
              required
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500 outline-none"
              placeholder="e.g. Lead Systems Architect"
            />
          </div>

          {/* Category Select */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Primary_Cluster</label>
            <select 
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value as ProjectCategory})}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500 outline-none appearance-none"
            >
              <option value="AI">Artificial Intelligence</option>
              <option value="Security">Cybersecurity</option>
              <option value="Cloud">Cloud Engineering</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Full-Stack">Full-Stack Development</option>
            </select>
          </div>

          {/* URLs */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Asset_Path (PDF/Doc)</label>
            <input 
              value={formData.pdf_url}
              onChange={e => setFormData({...formData, pdf_url: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-cyan-500 font-mono focus:border-cyan-500 outline-none"
              placeholder="projects/artifact.pdf"
            />
          </div>
        </div>

        {/* Dynamic Tool List */}
        <div className="space-y-4">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Technology_Stack</label>
          <div className="flex gap-2">
            <input 
              value={newTool}
              onChange={e => setNewTool(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTool())}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-cyan-500 outline-none"
              placeholder="Add Tool (e.g. Kubernetes)"
            />
            <button type="button" onClick={addTool} className="bg-slate-800 hover:bg-slate-700 p-3 rounded-xl transition-colors">
              <Plus className="h-4 w-4 text-cyan-400" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tools.map(t => (
              <span key={t} className="flex items-center gap-2 bg-slate-800 text-[10px] font-bold text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700">
                {t}
                <button type="button" onClick={() => setFormData({...formData, tools: formData.tools.filter(x => x !== t)})}>
                  <Trash2 className="h-3 w-3 text-red-500 hover:text-red-400" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Summary & Description */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Logic_Summary</label>
          <textarea 
            required
            value={formData.summary}
            onChange={e => setFormData({...formData, summary: e.target.value})}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500 outline-none min-h-[80px]"
            placeholder="High-level technical overview"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Deep_System_Description (Markdown Supported)</label>
          <textarea 
            required
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-400 font-mono focus:border-cyan-500 outline-none min-h-[200px]"
            placeholder="Detailed implementation logs, architecture decisions, and results..."
          />
        </div>

        {/* Action Bar */}
        <div className="flex justify-end gap-4 pt-6 border-t border-slate-800">
          <button 
            type="button" 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-white transition-colors"
          >
            ABORT_CHANGES
          </button>
          <button 
            type="submit"
            disabled={isPending}
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-cyan-600/20 flex items-center gap-3 text-xs disabled:opacity-50"
          >
            {isPending ? <Cpu className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            SYNCHRONIZE_TO_CLOUD
          </button>
        </div>
      </form>
    </div>
  );
}
