"use client";

// Prevent prerendering of this client page
export const dynamic = "force-dynamic";

import { type ComponentProps, type FormEvent, useCallback, useEffect, useState } from "react";
import {
  type LucideIcon, LayoutDashboard, FolderKanban, FlaskConical, Newspaper, User, FileText,
  Briefcase, GraduationCap, Award, Trophy, MessageSquare, Brain, Bot, Send, Plus, Download, X,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/infrastructure/security/headers";
import { isTextUIPart, type UIMessage } from "ai";
import { toast } from "react-hot-toast";
import ProjectEditor from "@/presentation/components/features/ProjectEditor";
import CredentialEditor from "@/presentation/components/features/CredentialEditor";
import CvImporter from "@/presentation/components/features/CvImporter";
import ResearchEditor from "@/presentation/components/features/ResearchEditor";
import ArticleEditor from "@/presentation/components/features/ArticleEditor";
import ProfileEditor from "@/presentation/components/features/ProfileEditor";
import InquiryVault from "@/presentation/components/features/InquiryVault";
import ResumeManager from "@/presentation/components/features/ResumeManager";
import AdminContentManager from "@/presentation/components/features/AdminContentManager";
import ManualSyncTool from "@/presentation/components/features/ManualSyncTool";
import SiteHealthPanel from "@/presentation/components/features/SiteHealthPanel";
import ResumeSectionManager from "@/presentation/components/features/ResumeSectionManager";

type EditableAdminItem = Record<string, unknown>;
type AdminChatMessage = UIMessage & { content?: string };

type Tab = {
  id: string;
  label: string;
  icon: LucideIcon;
  /** One line under the page title. */
  intro: string;
  /** Label for the header's "New" button; omitted when the tab can't create. */
  create?: string;
  /** Public page to preview this content on. */
  preview?: string;
};

const GROUPS: Array<{ title: string; tabs: Tab[] }> = [
  {
    title: "Start",
    tabs: [{ id: "overview", label: "Overview", icon: LayoutDashboard, intro: "Is the site healthy, and where does each section get its content?" }],
  },
  {
    title: "Website",
    tabs: [
      { id: "profile", label: "Homepage intro", icon: User, intro: "Headline, short intro, location and the open-to-work badge.", preview: "/" },
      { id: "projects", label: "Projects & ventures", icon: FolderKanban, intro: "Ventures and projects. Featured ones appear on the homepage.", create: "New project", preview: "/projects" },
      { id: "research", label: "Research", icon: FlaskConical, intro: "Studies and papers on the research page.", create: "New research", preview: "/research" },
      { id: "articles", label: "Blog", icon: Newspaper, intro: "Write, save drafts and publish articles.", create: "New article", preview: "/blog" },
    ],
  },
  {
    title: "Resume",
    tabs: [
      { id: "cv", label: "CV import & file", icon: FileText, intro: "Upload your CV: the AI reads it and fills every resume section for you to review.", preview: "/resume" },
      { id: "experiences", label: "Experience", icon: Briefcase, intro: "Roles, ventures and volunteering on the resume page and homepage. Leave the end date empty for a current role.", create: "Add role", preview: "/resume" },
      { id: "educations", label: "Education", icon: GraduationCap, intro: "Schools and programmes.", create: "Add education", preview: "/resume" },
      { id: "certificates", label: "Certificates", icon: Award, intro: "Certificates with proof links or PDFs.", create: "Add certificate", preview: "/resume" },
      { id: "achievements", label: "Awards", icon: Trophy, intro: "Prizes and recognition.", create: "Add award", preview: "/resume" },
    ],
  },
  {
    title: "People & AI",
    tabs: [
      { id: "inquiries", label: "Messages", icon: MessageSquare, intro: "Messages sent through the contact form." },
      { id: "training", label: "Assistant knowledge", icon: Brain, intro: "What the site's AI assistant knows when visitors ask about you." },
    ],
  },
];

const TABS = GROUPS.flatMap((g) => g.tabs);
const RESUME_TABS = ["experiences", "educations", "achievements"] as const;
type ResumeTab = (typeof RESUME_TABS)[number];
const isResumeTab = (t: string): t is ResumeTab => (RESUME_TABS as readonly string[]).includes(t);

function getAdminMessageText(message: AdminChatMessage): string {
  if (typeof message.content === "string") return message.content;
  return message.parts.filter(isTextUIPart).map((part) => part.text).join("");
}

function createAdminChatMessage(role: UIMessage["role"], content: string, id = `${role}-${Date.now()}`): AdminChatMessage {
  return { id, role, content, parts: [{ type: "text", text: content }] };
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [createSignal, setCreateSignal] = useState(0);

  // Keep the open tab in the address bar, so refresh and the back button work.
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("tab");
    if (fromUrl && TABS.some((t) => t.id === fromUrl)) setActiveTab(fromUrl);
  }, []);

  const openTab = useCallback((id: string) => {
    setActiveTab(id);
    setCreateSignal(0);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", id);
    window.history.replaceState(null, "", url);
    window.scrollTo({ top: 0 });
  }, []);

  const tab = TABS.find((t) => t.id === activeTab) ?? TABS[0];

  // Editor modals for the content types that have their own editors.
  const [showProjectEditor, setShowProjectEditor] = useState(false);
  const [showCredentialEditor, setShowCredentialEditor] = useState(false);
  const [showResearchEditor, setShowResearchEditor] = useState(false);
  const [showArticleEditor, setShowArticleEditor] = useState(false);
  const [editingItem, setEditingItem] = useState<EditableAdminItem | undefined>(undefined);
  const [listVersion, setListVersion] = useState(0);

  const openEditor = (item?: EditableAdminItem) => {
    setEditingItem(item);
    if (activeTab === "projects") setShowProjectEditor(true);
    else if (activeTab === "research") setShowResearchEditor(true);
    else if (activeTab === "articles") setShowArticleEditor(true);
    else if (activeTab === "certificates") setShowCredentialEditor(true);
    else if (isResumeTab(activeTab)) setCreateSignal((n) => n + 1);
  };

  const closeEditors = () => {
    setShowProjectEditor(false);
    setShowCredentialEditor(false);
    setShowResearchEditor(false);
    setShowArticleEditor(false);
    setListVersion((v) => v + 1); // reload the list so saved changes show
  };

  const anyEditorOpen = showProjectEditor || showCredentialEditor || showResearchEditor || showArticleEditor;

  // Esc closes an open editor.
  useEffect(() => {
    if (!anyEditorOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeEditors();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [anyEditorOpen]);

  // ─── AI assistant ──────────────────────────────────────────────────────
  const [aiInput, setAiInput] = useState("");
  const [messages, setMessages] = useState<AdminChatMessage[]>([
    createAdminChatMessage("assistant", "Hi! Ask me to draft a project description, summarise recent messages, or rewrite text in plain language.", "welcome"),
  ]);
  const [aiBusy, setAiBusy] = useState(false);

  const sendAdminMessage = useCallback(async (text: string) => {
    const next = [...messages, createAdminChatMessage("user", text, `user-${Date.now()}`)];
    setMessages(next);
    setAiBusy(true);
    try {
      const response = await fetch("/api/v1/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.map((m) => ({ role: m.role, content: getAdminMessageText(m) })) }),
      });
      const data = (await response.json()) as { id?: string; role?: string; content?: string; error?: string };
      if (!response.ok || !data.content) throw new Error(data.error || "The assistant didn't answer. Try again.");
      setMessages((prev) => [...prev, createAdminChatMessage((data.role as UIMessage["role"]) || "assistant", data.content!, data.id || `assistant-${Date.now()}`)]);
    } catch (error) {
      setMessages((prev) => [...prev, createAdminChatMessage("assistant", error instanceof Error ? error.message : "The assistant didn't answer.", `assistant-error-${Date.now()}`)]);
    } finally {
      setAiBusy(false);
    }
  }, [messages]);

  const handleAiSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = aiInput.trim();
    if (!text || aiBusy) return;
    void sendAdminMessage(text);
    setAiInput("");
  };

  const handleExportLogs = async () => {
    const id = toast.loading("Preparing the security log…");
    try {
      const response = await fetch("/api/v1/admin/security-logs");
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error();
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `security-log-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      toast.success("Security log downloaded.", { id });
    } catch {
      toast.error("Couldn't download the security log.", { id });
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-cyan-500/30">
      {/* Sidebar (desktop) */}
      <aside className="fixed left-0 top-16 z-30 hidden h-[calc(100vh-4rem)] w-64 flex-col border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl lg:flex">
        <nav aria-label="Admin sections" className="flex-1 space-y-5 overflow-y-auto p-4">
          {GROUPS.map((g) => (
            <div key={g.title}>
              <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">{g.title}</p>
              <ul className="space-y-0.5">
                {g.tabs.map((t) => (
                  <li key={t.id}>
                    <button
                      onClick={() => openTab(t.id)}
                      aria-current={activeTab === t.id ? "page" : undefined}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500",
                        activeTab === t.id ? "bg-cyan-600/15 font-medium text-cyan-300" : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
                      )}
                    >
                      <t.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      {t.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className="space-y-1 border-t border-slate-800 p-4">
          <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-800/60 hover:text-white">
            <ExternalLink className="h-4 w-4" aria-hidden="true" /> View live site
          </a>
          <button onClick={handleExportLogs} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-800/60 hover:text-white">
            <Download className="h-4 w-4" aria-hidden="true" /> Download security log
          </button>
        </div>
      </aside>

      <main className="min-h-screen p-4 sm:p-8 lg:ml-64">
        {/* Section picker (phones and tablets) */}
        <div className="mb-6 lg:hidden">
          <label htmlFor="admin-section" className="mb-1.5 block text-xs font-medium text-slate-500">Section</label>
          <select
            id="admin-section"
            value={activeTab}
            onChange={(e) => openTab(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white focus:border-cyan-500 focus:outline-none"
          >
            {GROUPS.map((g) => (
              <optgroup key={g.title} label={g.title}>
                {g.tabs.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Page header */}
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">{tab.label}</h1>
            <p className="mt-1 text-sm text-slate-400">{tab.intro}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {tab.preview && (
              <a href={tab.preview} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-cyan-500/50 hover:text-white">
                <ExternalLink className="h-4 w-4" aria-hidden="true" /> Preview
              </a>
            )}
            <button
              onClick={() => setIsAiOpen((v) => !v)}
              aria-pressed={isAiOpen}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition-colors",
                isAiOpen ? "border-cyan-500 bg-cyan-600 text-white" : "border-slate-700 text-slate-300 hover:border-cyan-500/50 hover:text-white"
              )}
            >
              <Bot className="h-4 w-4" aria-hidden="true" /> Writing assistant
            </button>
            {tab.create && (
              <button onClick={() => openEditor(undefined)} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500">
                <Plus className="h-4 w-4" aria-hidden="true" /> {tab.create}
              </button>
            )}
          </div>
        </header>

        {/* Editor modals */}
        {anyEditorOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true">
            <div className="mx-auto my-auto w-full max-w-4xl">
              {showProjectEditor && <ProjectEditor initialData={editingItem as ComponentProps<typeof ProjectEditor>["initialData"]} onClose={closeEditors} />}
              {showCredentialEditor && <CredentialEditor initialData={editingItem as ComponentProps<typeof CredentialEditor>["initialData"]} onClose={closeEditors} />}
              {showResearchEditor && <ResearchEditor initialData={editingItem as ComponentProps<typeof ResearchEditor>["initialData"]} onClose={closeEditors} />}
              {showArticleEditor && <ArticleEditor initialData={editingItem as ComponentProps<typeof ArticleEditor>["initialData"]} onClose={closeEditors} />}
            </div>
          </div>
        )}

        <div className={cn("grid gap-8", isAiOpen && "xl:grid-cols-[1fr_360px]")}>
          <div className="min-w-0 space-y-8">
            {activeTab === "overview" && <SiteHealthPanel onOpenTab={openTab} />}
            {activeTab === "profile" && <ProfileEditor />}
            {activeTab === "cv" && (
              <div className="space-y-8">
                <CvImporter />
                <ResumeManager />
              </div>
            )}
            {isResumeTab(activeTab) && <ResumeSectionManager key={activeTab} table={activeTab} createSignal={createSignal} />}
            {["projects", "research", "articles", "certificates"].includes(activeTab) && (
              <AdminContentManager key={`${activeTab}-${listVersion}`} table={activeTab} onEdit={(item) => openEditor(item)} />
            )}
            {activeTab === "inquiries" && <InquiryVault />}
            {activeTab === "training" && <ManualSyncTool />}
          </div>

          {/* Writing assistant */}
          {isAiOpen && (
            <aside aria-label="Writing assistant" className="flex h-[560px] flex-col overflow-hidden rounded-3xl border border-cyan-500/30 bg-slate-950 xl:sticky xl:top-8">
              <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/50 px-5 py-3">
                <span className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Bot className="h-4 w-4 text-cyan-400" aria-hidden="true" /> Writing assistant
                </span>
                <button onClick={() => setIsAiOpen(false)} aria-label="Close assistant" className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
                {messages.map((m) => (
                  <div key={m.id} className={cn("flex max-w-[90%] flex-col", m.role === "user" ? "ml-auto items-end" : "items-start")}>
                    <div className={cn(
                      "whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                      m.role === "user" ? "rounded-br-sm bg-cyan-600 text-white" : "rounded-bl-sm border border-slate-700 bg-slate-800 text-slate-200"
                    )}>
                      {getAdminMessageText(m)}
                    </div>
                  </div>
                ))}
                {aiBusy && <p className="text-xs text-slate-500">Thinking…</p>}
              </div>
              <form onSubmit={handleAiSubmit} className="flex gap-2 border-t border-slate-800 bg-slate-900/80 p-3">
                <label htmlFor="admin-ai-input" className="sr-only">Message the writing assistant</label>
                <input
                  id="admin-ai-input"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Ask for a draft or a rewrite…"
                  className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
                />
                <button type="submit" disabled={aiBusy || !aiInput.trim()} aria-label="Send" className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-600 text-white disabled:opacity-50">
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}
