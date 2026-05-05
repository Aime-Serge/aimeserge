"use client";

import { useState } from "react";
import { Award, Save, X, Upload, Calendar, ShieldCheck, Link as LinkIcon } from "lucide-react";
import { upsertContent, uploadArtifact } from "@/core/domain/admin/actions";
import { toast } from "react-hot-toast";

interface CredentialFormData {
  id?: string;
  name: string;
  provider: string;
  issue_date: string;
  expiry_date: string;
  verify_url: string;
  pdf_url: string;
  description: string;
}

interface CredentialEditorProps {
  initialData?: Partial<CredentialFormData>;
  onClose: () => void;
}

export default function CredentialEditor({ initialData, onClose }: CredentialEditorProps) {
  const [isPending, setIsPending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState<CredentialFormData>({
    id: initialData?.id || undefined,
    name: initialData?.name || "",
    provider: initialData?.provider || "ALX Africa",
    issue_date: initialData?.issue_date || "",
    expiry_date: initialData?.expiry_date || "",
    verify_url: initialData?.verify_url || "",
    pdf_url: initialData?.pdf_url || "",
    description: initialData?.description || "",
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const result = await uploadArtifact({ file, path: "certificates" });
    if (result.success) {
      setFormData({ ...formData, pdf_url: result.url as string });
      toast.success("Document uploaded to secure storage.");
    } else {
      const errorMsg = "error" in result ? (result.error as string) : (result as { message?: string }).message;
      toast.error("Upload failed: " + errorMsg);
    }
    setIsUploading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    const result = await upsertContent({ table: 'certificates', payload: formData, path: '/resume' });
    if (result.success) {
      toast.success("Credential synchronized.");
      onClose();
    } else {
      const errorMsg = "error" in result ? (result.error as string) : (result as { message?: string }).message;
      toast.error("Sync error: " + errorMsg);
    }
    setIsPending(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
      <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-600/20 flex items-center justify-center border border-emerald-500/30">
            <Award className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white uppercase tracking-tighter">Credential_Manager</h2>
            <p className="text-[10px] text-slate-500 font-mono">Verification Mode: Active</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
          <X className="h-5 w-5 text-slate-500" />
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Certificate Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Credential_Name</label>
            <input 
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none"
              placeholder="e.g. Google Cloud Professional Architect"
            />
          </div>

          {/* Provider */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Issuing_Authority</label>
            <select 
              value={formData.provider}
              onChange={e => setFormData({...formData, provider: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none appearance-none"
            >
              <option value="ALX Africa">ALX Africa</option>
              <option value="Google Cloud">Google Cloud</option>
              <option value="AWS">AWS</option>
              <option value="CompTIA">CompTIA</option>
              <option value="University of Rwanda">University of Rwanda</option>
            </select>
          </div>

          {/* Dates */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Calendar className="h-3 w-3" /> Issue_Date
            </label>
            <input 
              required
              type="text"
              value={formData.issue_date}
              onChange={e => setFormData({...formData, issue_date: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none"
              placeholder="e.g. Jan 2024"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Expiry_Date (Optional)</label>
            <input 
              type="text"
              value={formData.expiry_date}
              onChange={e => setFormData({...formData, expiry_date: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none"
              placeholder="e.g. Dec 2026"
            />
          </div>
        </div>

        {/* Verification Link */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
            <LinkIcon className="h-3 w-3" /> External_Verification_URL
          </label>
          <input 
            value={formData.verify_url}
            onChange={e => setFormData({...formData, verify_url: e.target.value})}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-cyan-500 font-mono focus:border-emerald-500 outline-none"
            placeholder="https://verify.cert.com/..."
          />
        </div>

        {/* PDF Upload */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Digital_Artifact (PDF)</label>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <input 
                type="text"
                readOnly
                value={formData.pdf_url}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-500 font-mono"
                placeholder="No artifact uploaded"
              />
              {isUploading && <div className="absolute right-4 top-1/2 -translate-y-1/2"><ShieldCheck className="h-4 w-4 text-emerald-500 animate-pulse" /></div>}
            </div>
            <label className="bg-slate-800 hover:bg-slate-700 p-3 rounded-xl cursor-pointer transition-colors border border-slate-700">
              <Upload className="h-5 w-5 text-emerald-400" />
              <input type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} />
            </label>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Credential_Scope</label>
          <textarea 
            required
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none min-h-[100px]"
            placeholder="Key skills and mastery verified by this credential..."
          />
        </div>

        {/* Action Bar */}
        <div className="flex justify-end gap-4 pt-6 border-t border-slate-800">
          <button 
            type="button" 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-white transition-colors"
          >
            DISCARD
          </button>
          <button 
            type="submit"
            disabled={isPending || isUploading}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-3 text-xs disabled:opacity-50"
          >
            {isPending ? <ShieldCheck className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            SYNCHRONIZE_CREDENTIAL
          </button>
        </div>
      </form>
    </div>
  );
}
