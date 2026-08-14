"use client";

import dynamic from "next/dynamic";
import { Toaster } from "react-hot-toast";

const AIChat = dynamic(() => import("@/presentation/components/features/AIChat"), {
  ssr: false,
});

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="contents">
      <Toaster position="top-right" />
      {children}
      <AIChat />
    </div>
  );
}
