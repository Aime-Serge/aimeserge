"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Terminal as TerminalIcon } from "lucide-react";

type Command = {
  input: string;
  output: React.ReactNode;
};

export default function TerminalUI() {
  const [history, setHistory] = useState<Command[]>([]);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim().toLowerCase();
    setInput("");

    if (!cmd) return;

    let output: React.ReactNode = "";

    switch (cmd) {
      case "help":
        output = (
          <div className="text-slate-300">
            Available commands: <br />
            <span className="text-cyan-400">about</span>    - Learn about me<br />
            <span className="text-cyan-400">projects</span> - View my portfolio<br />
            <span className="text-cyan-400">skills</span>   - List my technical skills<br />
            <span className="text-cyan-400">contact</span>  - Get my contact info<br />
            <span className="text-cyan-400">clear</span>    - Clear the terminal<br />
            <span className="text-cyan-400">gui</span>      - Return to visual interface
          </div>
        );
        break;
      case "about":
        output = "Senior Software Engineer specialized in Cybersecurity and Cloud Engineering. Building production-ready, AI-driven solutions.";
        break;
      case "projects":
        output = "Navigating to projects repository...";
        setTimeout(() => router.push("/projects"), 800);
        break;
      case "skills":
        output = (
          <div className="grid grid-cols-2 gap-2 text-slate-300 max-w-md mt-2">
            <div>- Next.js / React Server Components</div>
            <div>- Supabase / PostgreSQL / Vector DB</div>
            <div>- Cloud Infra (AWS / Vercel Edge)</div>
            <div>- Zero-Trust Security / Pen Testing</div>
            <div>- AI / LLM / RAG Integration</div>
            <div>- TypeScript / Node.js / Python</div>
          </div>
        );
        break;
      case "contact":
        output = "Email: aime@example.com | LinkedIn: /in/aimeserge";
        break;
      case "clear":
        setHistory([]);
        return;
      case "gui":
        output = "Initializing GUI mode...";
        setTimeout(() => router.push("/"), 800);
        break;
      default:
        output = <span className="text-red-400">Command not found: {cmd}. Type &apos;help&apos; for available commands.</span>;
    }

    setHistory((prev) => [...prev, { input: cmd, output }]);
  };

  return (
    <div className="flex h-[60vh] w-full max-w-4xl flex-col rounded-xl border border-slate-800 bg-slate-950/80 font-mono shadow-2xl backdrop-blur-md">
      {/* Terminal Header */}
      <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-900/50 px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-500/80" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
        </div>
        <div className="ml-4 flex items-center text-xs text-slate-400">
          <TerminalIcon className="mr-2 h-3 w-3" />
          aime-serge@cyber-cloud: ~
        </div>
      </div>
      
      {/* Terminal Body */}
      <div className="flex-1 overflow-y-auto p-4 text-sm scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-700" onClick={() => inputRef.current?.focus()}>
        <div className="mb-6 text-emerald-400">
          Welcome to the Cyber-Cloud Terminal v2.0.0.<br />
          System check... <span className="text-cyan-400">OK</span>.<br />
          Type &apos;help&apos; to see available commands.
        </div>
        
        {history.map((cmd, i) => (
          <div key={i} className="mb-4">
            <div className="flex text-slate-300">
              <span className="mr-2 text-cyan-400">aime-serge@cyber-cloud:~$</span>
              {cmd.input}
            </div>
            <div className="mt-1 text-slate-400">{cmd.output}</div>
          </div>
        ))}
        
        <form onSubmit={handleCommand} className="flex">
          <span className="mr-2 text-cyan-400">aime-serge@cyber-cloud:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent text-slate-300 outline-none"
            spellCheck={false}
            autoComplete="off"
            autoFocus
          />
        </form>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
