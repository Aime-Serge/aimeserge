"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Trash2, Mail, Phone, Globe, User, Briefcase, Zap, Activity } from "lucide-react";
import { deleteContent } from "@/domain/admin/actions";
import { supabase } from "@/infrastructure/database/client";
import { toast } from "react-hot-toast";
import { cn } from "@/infrastructure/security/headers";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  created_at: string;
  interest: string;
  contact_type: string;
  newsletter_opt_in: boolean;
  location?: string | null;
  message?: string | null;
  whatsapp?: string | null;
  linkedin_url?: string | null;
}

export default function InquiryVault() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  async function loadInquiries() {
    const { data } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });
    setInquiries((data as Inquiry[]) || []);
    setIsLoading(false);
  }

  useEffect(() => {
    loadInquiries();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to archive this inquiry?")) return;
    const result = await deleteContent({ table: 'contacts', id, path: '/admin' });
    if (result.success) {
      toast.success("Inquiry archived.");
      loadInquiries();
      if (selectedInquiry?.id === id) setSelectedInquiry(null);
    }
  };

  if (isLoading) return <div className="p-12 text-center animate-pulse text-slate-500 font-mono">FETCHING_INQUIRIES...</div>;

  return (
    <div className="grid gap-8 lg:grid-cols-[400px_1fr] h-[calc(100vh-250px)]">
      {/* Sidebar: List */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden flex flex-col backdrop-blur-md">
        <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Activity className="h-3 w-3 text-cyan-500" /> Incoming_Signal ({inquiries.length})
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-800">
          {inquiries.map((inq) => (
            <button
              key={inq.id}
              onClick={() => setSelectedInquiry(inq)}
              className={cn(
                "w-full p-5 text-left border-b border-slate-800/50 transition-all hover:bg-slate-800/30 group",
                selectedInquiry?.id === inq.id ? "bg-cyan-600/10 border-l-2 border-l-cyan-500" : ""
              )}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-white text-sm truncate pr-2">{inq.name}</span>
                <span className="text-[9px] text-slate-600 font-mono">{new Date(inq.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-xs text-slate-500 truncate mb-2">{inq.interest} / {inq.contact_type}</p>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter",
                  inq.newsletter_opt_in ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-800 text-slate-600"
                )}>
                  {inq.newsletter_opt_in ? "Subscribed" : "Single_Comm"}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main View: Detail */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl backdrop-blur-md overflow-hidden flex flex-col">
        {selectedInquiry ? (
          <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/20">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-cyan-600/10 flex items-center justify-center border border-cyan-500/20">
                  <User className="h-6 w-6 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">{selectedInquiry.name}</h2>
                  <p className="text-xs text-slate-500 font-mono">{selectedInquiry.email}</p>
                </div>
              </div>
              <button 
                onClick={() => handleDelete(selectedInquiry.id)}
                className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Demographics Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/50">
                  <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1 flex items-center gap-2"><Zap className="h-3 w-3 text-cyan-500" /> Interest_Matrix</p>
                  <p className="text-sm font-bold text-slate-200">{selectedInquiry.interest}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/50">
                  <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1 flex items-center gap-2"><Globe className="h-3 w-3 text-emerald-500" /> Origin_Node</p>
                  <p className="text-sm font-bold text-slate-200">{selectedInquiry.location || "Unknown"}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/50">
                  <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1 flex items-center gap-2"><Briefcase className="h-3 w-3 text-purple-500" /> Entity_Type</p>
                  <p className="text-sm font-bold text-slate-200">{selectedInquiry.contact_type}</p>
                </div>
              </div>

              {/* Message Payload */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                  <MessageSquare className="h-3 w-3" /> Data_Payload_Intercept
                </h4>
                <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 leading-relaxed text-slate-300 whitespace-pre-wrap italic">
                  &quot;{selectedInquiry.message}&quot;
                </div>
              </div>

              {/* Contact Nodes */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Communication_Nodes</h4>
                <div className="flex flex-wrap gap-3">
                  {selectedInquiry.whatsapp && (
                    <a href={`https://wa.me/${selectedInquiry.whatsapp}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-bold hover:bg-emerald-500 hover:text-white transition-all">
                      <Phone className="h-3.5 w-3.5" /> WhatsApp
                    </a>
                  )}
                  {selectedInquiry.linkedin_url && (
                    <a href={selectedInquiry.linkedin_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 text-xs font-bold hover:bg-blue-500 hover:text-white transition-all">
                      <Globe className="h-3.5 w-3.5" /> LinkedIn_Node
                    </a>
                  )}
                  <a href={`mailto:${selectedInquiry.email}`} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 text-xs font-bold hover:bg-cyan-500 hover:text-white transition-all">
                    <Mail className="h-3.5 w-3.5" /> Direct_SMTP
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-600 p-12">
            <MessageSquare className="h-16 w-16 opacity-10 mb-4" />
            <p className="text-xs font-mono uppercase tracking-widest animate-pulse">Select_Signal_To_Decrypt</p>
          </div>
        )}
      </div>
    </div>
  );
}
