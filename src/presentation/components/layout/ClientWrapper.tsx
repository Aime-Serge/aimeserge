"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Toaster } from "react-hot-toast";
import { Bot } from "lucide-react";

// The chat (≈550 lines, speech + audio code) is downloaded only after the
// visitor clicks the button, not on every page view.
const AIChat = dynamic(() => import("@/presentation/components/features/AIChat"), {
  ssr: false,
  loading: () => null,
});

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [chatRequested, setChatRequested] = useState(false);

  return (
    <div className="contents">
      <Toaster position="top-right" />
      {children}
      {chatRequested ? (
        <AIChat defaultOpen />
      ) : (
        <button
          type="button"
          onClick={() => setChatRequested(true)}
          onMouseEnter={() => import("@/presentation/components/features/AIChat")}
          onFocus={() => import("@/presentation/components/features/AIChat")}
          aria-label="Ask my AI assistant about my work"
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-600 text-white shadow-lg transition hover:bg-cyan-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          <Bot className="h-6 w-6" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
