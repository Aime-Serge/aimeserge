"use client";

// Prevent prerendering of this client page
export const dynamic = 'force-dynamic';

import { type ComponentProps, type FormEvent, useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, LayoutDashboard, Database, FileText, 
  MessageSquare, Plus, 
  TrendingUp, Users, Download, Bot, Send, 
  Mic, Activity, Zap, Cpu, Award, Brain, Globe
} from "lucide-react";
import { cn } from "@/infrastructure/security/headers";
import { isTextUIPart, type UIMessage } from "ai";
import { toast } from "react-hot-toast";
import ProjectEditor from "@/presentation/components/features/ProjectEditor";
import CredentialEditor from "@/presentation/components/features/CredentialEditor";
import ResearchEditor from "@/presentation/components/features/ResearchEditor";
import BroadcastEditor from "@/presentation/components/features/BroadcastEditor";
import InquiryVault from "@/presentation/components/features/InquiryVault";
import ResumeManager from "@/presentation/components/features/ResumeManager";
import AdminContentManager from "@/presentation/components/features/AdminContentManager";
import ManualSyncTool from "@/presentation/components/features/ManualSyncTool";
import SyndicationDashboard from "@/presentation/components/features/SyndicationDashboard";
type EditableAdminItem = Record<string, unknown>;

type AdminChatMessage = UIMessage & {
  content?: string;
};

function getAdminMessageText(message: AdminChatMessage): string {
  if (typeof message.content === "string") {
    return message.content;
  }

  return message.parts
    .filter(isTextUIPart)
    .map((part) => part.text)
    .join("");
}

function createAdminChatMessage(role: UIMessage["role"], content: string, id = `${role}-${Date.now()}`): AdminChatMessage {
  return {
    id,
    role,
    content,
    parts: [{ type: "text", text: content }],
  };
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({ totalViews: 0, totalInquiries: 0, researchImpact: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isAiActive, setIsAiActive] = useState(false);
  
  // Modal States
  const [showProjectEditor, setShowProjectEditor] = useState(false);
  const [showCredentialEditor, setShowCredentialEditor] = useState(false);
  const [showResearchEditor, setShowResearchEditor] = useState(false);
  const [showBroadcastEditor, setShowBroadcastEditor] = useState(false);

  // Edit States
  const [editingItem, setEditingItem] = useState<EditableAdminItem | undefined>(undefined);
  
  const handleEdit = (item: EditableAdminItem) => {
    setEditingItem(item);
    if (activeTab === 'projects') setShowProjectEditor(true);
    else if (activeTab === 'research') setShowResearchEditor(true);
    else if (activeTab === 'broadcasts') setShowBroadcastEditor(true);
    else setShowCredentialEditor(true);
  };

  const [aiInput, setAiInput] = useState("");
  const [messages, setMessages] = useState<AdminChatMessage[]>([
    createAdminChatMessage(
      "assistant",
      'Admin Session Established. I am ready to help you manage your portfolio artifacts. You can ask me to "List recent inquiries" or "Prepare a new project entry".',
      "welcome"
    ),
  ]);
  const [chatStatus, setChatStatus] = useState<"ready" | "submitted">("ready");

  const handleExportLogs = async () => {
    toast.loading("Fetching audit trail...");
    try {
      const response = await fetch('/api/v1/admin/security-logs');
      if (!response.ok) throw new Error('Failed to fetch logs');
      const result = await response.json();
      
      if (result.success && result.data) {
        const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `security_audit_${new Date().toISOString()}.json`;
        a.click();
        toast.dismiss();
        toast.success("Audit Logs Exported.");
      } else {
        toast.dismiss();
        toast.error("Export Failed.");
      }
    } catch (error) {
      console.error('Failed to export logs:', error);
      toast.dismiss();
      toast.error("Export Failed.");
    }
  };

  const sendAdminMessage = useCallback(async (text: string) => {
    const userMessage = createAdminChatMessage("user", text, `user-${Date.now()}`);

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setChatStatus("submitted");

    try {
      const response = await fetch("/api/v1/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((message) => ({
            role: message.role,
            content: getAdminMessageText(message),
          })),
        }),
      });

      const data = (await response.json()) as { id?: string; role?: string; content?: string; error?: string };

      if (!response.ok || !data.content) {
        throw new Error(data.error || "AI response failed");
      }

      const assistantContent = data.content;
      setMessages((prev) => [...prev, createAdminChatMessage((data.role as UIMessage["role"]) || "assistant", assistantContent, data.id || `assistant-${Date.now()}`)]);
    } catch (error) {
      const fallback = error instanceof Error ? error.message : "AI response failed";
      setMessages((prev) => [...prev, createAdminChatMessage("assistant", fallback, `assistant-error-${Date.now()}`)]);
    } finally {
      setChatStatus("ready");
    }
  }, [messages]);

  const isAiThinking = chatStatus === "submitted";

  const handleAiSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isAiActive || isAiThinking) {
      return;
    }

    const trimmedInput = aiInput.trim();
    if (!trimmedInput) {
      return;
    }

    void sendAdminMessage(trimmedInput);
    setAiInput("");
  }, [aiInput, isAiActive, isAiThinking, sendAdminMessage]);

  useEffect(() => {
    async function loadStats() {
      try {
        // Fetch analytics from server endpoint instead of direct function
        const response = await fetch('/api/v1/admin/analytics');
        if (!response.ok) throw new Error('Failed to fetch analytics');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to load analytics:', error);
        // Set default stats on error
        setStats({ totalViews: 0, totalInquiries: 0, researchImpact: 0 });
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "resume", label: "Resume/CV", icon: FileText },
    { id: "projects", label: "Projects", icon: Database },
    { id: "research", label: "Research", icon: FileText },
    { id: "broadcasts", label: "Blog", icon: TrendingUp },
    { id: "syndication", label: "Syndication", icon: Globe },
    { id: "training", label: "AI Training", icon: Brain },
    { id: "certificates", label: "Certificates", icon: Award },
    { id: "inquiries", label: "Inquiries", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-cyan-500/30">
      {/* Admin Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl hidden lg:block z-30">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-cyan-600 flex items-center justify-center shadow-[0_0_15px_rgba(8,145,178,0.4)]">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold tracking-tight text-white uppercase text-xs">Admin_Control_Node</span>
          </div>
        </div>
        
        <nav className="p-4 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                activeTab === tab.id 
                  ? "bg-cyan-600/10 text-cyan-400 border border-cyan-600/20" 
                  : "text-slate-500 hover:bg-slate-800/50 hover:text-slate-300"
              )}
            >
              {activeTab === tab.id && (
                <motion.div layoutId="tab-pill" className="absolute left-0 w-1 h-6 bg-cyan-500 rounded-r-full" />
              )}
              <tab.icon className={cn("h-5 w-5", activeTab === tab.id ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-300")} />
              <span className="font-bold text-xs uppercase tracking-wider">{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* AI Status in Sidebar */}
        <div className="absolute bottom-8 left-4 right-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Digital Twin</span>
              <div className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed italic">&quot;Always active, optimizing your cloud presence.&quot;</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 p-8 min-h-screen relative">
        {/* Header */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">Portfolio_Orchestrator</h1>
            <p className="text-slate-500 text-xs mt-1 font-mono uppercase tracking-widest">Secure Admin Session // Auth: Verified</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsAiActive(!isAiActive)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                isAiActive 
                  ? "bg-cyan-600 border-cyan-500 text-white shadow-[0_0_20px_rgba(8,145,178,0.3)]" 
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
              )}
            >
              <Bot className="h-4 w-4" />
              {isAiActive ? "AI_CONSOLE_ON" : "AI_CONSOLE_OFF"}
            </button>
            <button 
              onClick={() => { 
                setEditingItem(undefined);
                if (activeTab === 'projects') setShowProjectEditor(true);
                else if (activeTab === 'research') setShowResearchEditor(true);
                else if (activeTab === 'broadcasts') setShowBroadcastEditor(true);
                else setShowCredentialEditor(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2 text-xs"
            >
              <Plus className="h-4 w-4" />
              CREATE_ARTIFACT
            </button>
          </div>
        </header>

        <AnimatePresence>
          {showProjectEditor && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
              <div className="max-w-4xl w-full my-auto">
                <ProjectEditor initialData={editingItem as ComponentProps<typeof ProjectEditor>["initialData"]} onClose={() => setShowProjectEditor(false)} />
              </div>
            </div>
          )}
          {showCredentialEditor && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
              <div className="max-w-4xl w-full my-auto">
                <CredentialEditor initialData={editingItem as ComponentProps<typeof CredentialEditor>["initialData"]} onClose={() => setShowCredentialEditor(false)} />
              </div>
            </div>
          )}
          {showResearchEditor && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
              <div className="max-w-4xl w-full my-auto">
                <ResearchEditor initialData={editingItem as ComponentProps<typeof ResearchEditor>["initialData"]} onClose={() => setShowResearchEditor(false)} />
              </div>
            </div>
          )}
          {showBroadcastEditor && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
              <div className="max-w-4xl w-full my-auto">
                <BroadcastEditor initialData={editingItem as ComponentProps<typeof BroadcastEditor>["initialData"]} onClose={() => setShowBroadcastEditor(false)} />
              </div>
            </div>
          )}
        </AnimatePresence>

        <div className="grid gap-10 lg:grid-cols-[1fr_350px]">
          {/* Left Grid: Tab Content */}
          <div className="space-y-10">
            {activeTab === "overview" && (
              <>
                {/* Stats Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    { label: "Aggregate Traffic", val: stats.totalViews, icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
                    { label: "Active Inquiries", val: stats.totalInquiries, icon: MessageSquare, color: "text-purple-400", bg: "bg-purple-400/10" },
                    { label: "Research Impact", val: stats.researchImpact, icon: Download, color: "text-emerald-400", bg: "bg-emerald-400/10" },
                  ].map((stat, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ y: -5 }}
                      className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl backdrop-blur-md relative overflow-hidden group"
                    >
                      <div className="absolute top-0 right-0 h-24 w-24 bg-white/5 blur-3xl rounded-full -mr-12 -mt-12 group-hover:bg-white/10 transition-colors" />
                      <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className={cn("p-3 rounded-2xl", stat.bg)}>
                          <stat.icon className={cn("h-6 w-6", stat.color)} />
                        </div>
                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Global_Node</span>
                      </div>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest relative z-10">{stat.label}</p>
                      <h2 className="text-4xl font-bold text-white mt-2 tracking-tighter relative z-10">
                        {isLoading ? "..." : stat.val.toLocaleString()}
                      </h2>
                    </motion.div>
                  ))}
                </div>

                {/* System Monitoring Section */}
                <section className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 backdrop-blur-md">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-bold text-white flex items-center gap-3 uppercase tracking-tighter">
                      <Cpu className="h-5 w-5 text-cyan-500" />
                      Cloud_Node_Telemetry
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-500 bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/20">
                      <Activity className="h-3 w-3 animate-pulse" />
                      HEALTH_STABLE
                    </div>
                  </div>
                  
                  <div className="h-48 flex items-end gap-2 px-2">
                    {[40, 60, 45, 90, 100, 80, 50, 70, 85, 60, 40, 95, 70, 50, 80].map((h, i) => (
                      <motion.div 
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        className="flex-1 bg-gradient-to-t from-cyan-600/20 to-cyan-500/40 border-t border-cyan-500/50 rounded-t-sm"
                      />
                    ))}
                  </div>
                  <div className="mt-4 flex justify-between text-[9px] font-mono text-slate-600 uppercase tracking-[0.2em]">
                    <span>00:00 UTC</span>
                    <span>SESSION_START</span>
                    <span>LIVE_SYNC</span>
                  </div>
                </section>
                </>
                )}

                {/* Resume Asset Management */}
                {activeTab === "resume" && (
                <ResumeManager />
                )}

                {/* Inquiry Vault View */}
                {activeTab === "inquiries" && (
                <InquiryVault />
                )}

                {/* AI Training Module */}
                {activeTab === "training" && (
                <ManualSyncTool />
                )}

                {/* Content Syndication Module */}
                {activeTab === "syndication" && (
                <SyndicationDashboard />
                )}

                {/* Content Management Modules */}
                {["projects", "research", "broadcasts", "certificates"].includes(activeTab) && (
                  <AdminContentManager table={activeTab} onEdit={handleEdit} />
                )}
                </div>

          {/* Right Grid: AI Control Console */}
          <aside className="space-y-6">
            <div className={cn(
              "flex flex-col h-[600px] rounded-3xl border transition-all duration-500 overflow-hidden",
              isAiActive 
                ? "bg-slate-950 border-cyan-500/30 shadow-[0_0_30px_rgba(8,145,178,0.1)]" 
                : "bg-slate-900/20 border-slate-800 opacity-50 grayscale"
            )}>
              {/* AI Console Header */}
              <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <Bot className="h-5 w-5 text-cyan-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-widest">AI_Admin_Core</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500/50" />
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-800">
                {messages.map((m) => {
                  const messageText = getAdminMessageText(m as AdminChatMessage);

                  return (
                  <div key={m.id} className={cn(
                    "flex flex-col max-w-[90%]",
                    m.role === 'user' ? "ml-auto items-end" : "items-start"
                  )}>
                    <div className={cn(
                      "px-4 py-2.5 rounded-2xl text-[11px] leading-relaxed",
                      m.role === 'user' 
                        ? "bg-cyan-600 text-white rounded-br-sm shadow-lg" 
                        : "bg-slate-800 text-slate-300 rounded-bl-sm border border-slate-700"
                    )}>
                      {messageText}
                    </div>
                  </div>
                );
                })}
                {isAiThinking && (
                  <div className="flex items-center gap-1.5 p-2 bg-slate-800/50 rounded-xl w-fit">
                    <span className="h-1 w-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-1 w-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-1 w-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
              </div>

              {/* AI Input Area */}
              <form onSubmit={handleAiSubmit} className="p-4 bg-slate-900/80 border-t border-slate-800">
                <div className="relative flex items-center gap-2">
                  <button
                    disabled={!isAiActive}
                    type="button"
                    className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-800 text-slate-500 hover:text-cyan-400 transition-colors"
                  >
                    <Mic className="h-4 w-4" />
                  </button>
                  <input
                    disabled={!isAiActive}
                    value={aiInput}
                    onChange={(event) => setAiInput(event.target.value)}
                    placeholder="Enter AI Admin Command..."
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-all"
                  />
                  <button
                    disabled={!isAiActive || isAiThinking || !aiInput.trim()}
                    type="submit"
                    className="h-10 w-10 flex items-center justify-center rounded-xl bg-cyan-600 text-white shadow-lg shadow-cyan-600/20"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>

            {/* Quick Actions Card */}
            <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-md">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Security_Protocols</h4>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/30 transition-all group">
                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-cyan-400 transition-colors">PURGE_CDN_CACHE</span>
                  <Zap className="h-3 w-3 text-slate-600 group-hover:text-cyan-500" />
                </button>
                <button 
                  onClick={handleExportLogs}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/30 transition-all group"
                >
                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-cyan-400 transition-colors">EXPORT_LOGS</span>
                  <Activity className="h-3 w-3 text-slate-600 group-hover:text-cyan-500" />
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
