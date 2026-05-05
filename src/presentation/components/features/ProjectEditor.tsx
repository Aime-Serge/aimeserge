"use client";

import { useState } from "react";
import { Plus, Trash2, Save, X, Database, Cpu } from "lucide-react";
import { upsertContent } from "@/core/domain/admin/actions";
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
  is_current: boolean;
  start_date: { month: string; year: string };
  end_date: { month: string; year: string };
  contributors: string[];
  association: string;
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
    is_current: initialData?.is_current || false,
    start_date: initialData?.start_date || { month: "January", year: "2024" },
    end_date: initialData?.end_date || { month: "December", year: "2024" },
    contributors: Array.isArray(initialData?.contributors) ? initialData.contributors : [],
    association: initialData?.association || "",
  });

  const [newTool, setNewTool] = useState("");
  const [newContributor, setNewContributor] = useState("");

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

  const addContributor = () => {
    if (newContributor && !formData.contributors.includes(newContributor)) {
      setFormData({ ...formData, contributors: [...formData.contributors, newContributor] });
      setNewContributor("");
    }
  };

  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => (currentYear - i).toString());

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
      <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-cyan-600/20 flex items-center justify-center border border-cyan-500/30">
            <Database className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white uppercase tracking-tighter">Project_Editor_v1.1</h2>
            <p className="text-[10px] text-slate-500 font-mono">ID: {formData.id || 'NEW_RECORD'}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
          <X className="h-5 w-5 text-slate-500" />
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8 max-h-[70vh] overflow-y-auto px-2">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Title & Slug */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Artifact_Title (Project Name)</label>
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

          {/* Association & Role */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Associated_With</label>
            <input 
              value={formData.association}
              onChange={e => setFormData({...formData, association: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500 outline-none"
              placeholder="e.g. University, Company, or Independent"
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

        {/* LinkedIn Specific: Dates & Current Status */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-6">
          <div className="flex items-center gap-3">
            <input 
              type="checkbox"
              id="is_current"
              checked={formData.is_current}
              onChange={e => setFormData({...formData, is_current: e.target.checked})}
              className="h-4 w-4 rounded border-slate-800 bg-slate-900 text-cyan-600 focus:ring-cyan-500"
            />
            <label htmlFor="is_current" className="text-xs font-medium text-slate-300">I am currently working on this project</label>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Start_Date</label>
              <div className="flex gap-2">
                <select 
                  value={formData.start_date.month}
                  onChange={e => setFormData({...formData, start_date: {...formData.start_date, month: e.target.value}})}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none"
                >
                  {months.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select 
                  value={formData.start_date.year}
                  onChange={e => setFormData({...formData, start_date: {...formData.start_date, year: e.target.value}})}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none"
                >
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            {!formData.is_current && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">End_Date</label>
                <div className="flex gap-2">
                  <select 
                    value={formData.end_date.month}
                    onChange={e => setFormData({...formData, end_date: {...formData.end_date, month: e.target.value}})}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none"
                  >
                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select 
                    value={formData.end_date.year}
                    onChange={e => setFormData({...formData, end_date: {...formData.end_date, year: e.target.value}})}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none"
                  >
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contributors & Tools */}
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Technology_Stack (Skills)</label>
            <div className="flex gap-2">
              <input 
                value={newTool}
                onChange={e => setNewTool(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTool())}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-cyan-500 outline-none"
                placeholder="Add Skill"
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

          <div className="space-y-4">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Contributors</label>
            <div className="flex gap-2">
              <input 
                value={newContributor}
                onChange={e => setNewContributor(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addContributor())}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-cyan-500 outline-none"
                placeholder="Add Contributor"
              />
              <button type="button" onClick={addContributor} className="bg-slate-800 hover:bg-slate-700 p-3 rounded-xl transition-colors">
                <Plus className="h-4 w-4 text-cyan-400" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.contributors.map(c => (
                <span key={c} className="flex items-center gap-2 bg-slate-800 text-[10px] font-bold text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700">
                  {c}
                  <button type="button" onClick={() => setFormData({...formData, contributors: formData.contributors.filter(x => x !== c)})}>
                    <Trash2 className="h-3 w-3 text-red-500 hover:text-red-400" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Summary & Description */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Tagline</label>
          <input 
            required
            value={formData.tagline}
            onChange={e => setFormData({...formData, tagline: e.target.value})}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500 outline-none"
            placeholder="The 'hook' for this project"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Description (Max 2000 chars)</label>
          <textarea 
            required
            maxLength={2000}
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-400 font-mono focus:border-cyan-500 outline-none min-h-[200px]"
            placeholder="Detailed implementation logs, architecture decisions, and results..."
          />
          <div className="text-[10px] text-slate-500 text-right font-mono">
            {formData.description.length}/2,000
          </div>
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
