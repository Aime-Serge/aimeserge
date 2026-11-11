"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Terminal as TerminalIcon, Eraser, X } from "lucide-react";
import {
  ALL_NAMES, VISIBLE_NAMES, RunContext, Run, closest, findCommand,
  type TerminalContext,
} from "./terminal/commands";
import type { TerminalData } from "./terminal/types";

type Entry = { id: number; input: string; output: React.ReactNode };

const PROMPT = "visitor@aimeserge:~$";
/** Tap-to-run shortcuts, mainly for phones where typing is slow. */
const QUICK = ["about", "ventures", "projects", "impact", "experience", "contact", "cv", "help"];

/** Longest shared start of a list of words (for Tab completion). */
const sharedPrefix = (words: string[]) =>
  words.reduce((p, w) => {
    let i = 0;
    while (i < p.length && i < w.length && p[i] === w[i]) i++;
    return p.slice(0, i);
  });

/** Only grab focus with a mouse/trackpad; on phones it would pop up the keyboard. */
const finePointer = () => typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;

export default function TerminalUI({ data }: { data: TerminalData }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [input, setInput] = useState("");
  const [past, setPast] = useState<string[]>([]);
  const [cursor, setCursor] = useState<number | null>(null); // position while browsing ↑ ↓
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);
  const router = useRouter();

  const focusInput = useCallback(() => {
    if (finePointer()) inputRef.current?.focus({ preventScroll: true });
  }, []);

  // Focus the prompt without scrolling the page: the page must open at the top.
  useEffect(() => {
    focusInput();
  }, [focusInput]);

  // Keep the newest output visible by scrolling only the terminal body.
  // (scrollIntoView would also scroll the whole page down.)
  useEffect(() => {
    if (entries.length === 0) return;
    const body = bodyRef.current;
    if (body) body.scrollTo({ top: body.scrollHeight, behavior: "smooth" });
  }, [entries]);

  /** Wipe the output and the half-typed line, like a real terminal. */
  const clearScreen = useCallback(() => {
    setEntries([]);
    setInput("");
    setCursor(null);
    focusInput();
  }, [focusInput]);

  /** Go back where the visitor came from on this site, otherwise to the homepage. */
  const quit = useCallback(() => {
    setTimeout(() => {
      // In-site link clicks don't update document.referrer, so ask the browser's
      // history first (Navigation API lists only this site's entries), then fall back.
      let previous: string | undefined;
      try {
        const nav = (window as unknown as {
          navigation?: { canGoBack: boolean; currentEntry: { index: number } | null; entries: () => Array<{ url: string | null }> };
        }).navigation;
        if (nav?.currentEntry) {
          previous = nav.canGoBack ? nav.entries()[nav.currentEntry.index - 1]?.url ?? undefined : undefined;
        } else if (document.referrer && window.history.length > 1) {
          previous = document.referrer;
        }
      } catch {
        /* unreadable history: fall back to the homepage */
      }
      let fromThisSite = false;
      try {
        const prev = previous ? new URL(previous) : null;
        fromThisSite = !!prev && prev.origin === window.location.origin && prev.pathname !== "/terminal";
      } catch {
        /* malformed URL: fall back to the homepage */
      }
      if (fromThisSite) router.back();
      else router.push("/");
    }, 400);
  }, [router]);

  const print = useCallback((inputText: string, output: React.ReactNode) => {
    setEntries((prev) => [...prev, { id: nextId.current++, input: inputText, output }]);
  }, []);

  const run = useCallback(
    (raw: string) => {
      const line = raw.trim();
      setInput("");
      setCursor(null);
      if (!line) return;

      const history = [...past, line];
      setPast(history);

      const [name, ...args] = line.split(/\s+/);
      const command = findCommand(name);

      if (!command) {
        const guess = closest(name.toLowerCase(), ALL_NAMES);
        print(
          line,
          <div className="text-red-400">
            Command not found: {name}.{" "}
            {guess ? (
              <>
                Did you mean <Run cmd={[guess, ...args].join(" ")}>{guess}</Run>?
              </>
            ) : (
              <>
                Type <Run cmd="help" /> to see what you can do.
              </>
            )}
          </div>
        );
        return;
      }

      const ctx: TerminalContext = {
        data,
        history,
        navigate: (path) => setTimeout(() => router.push(path), 500),
        openExternal: (url) => window.open(url, "_blank", "noopener,noreferrer"),
        clear: clearScreen,
        quit,
      };

      const output = command.run(args, ctx);
      if (command.name !== "clear") print(line, output);
    },
    [data, past, print, router, clearScreen, quit]
  );

  const runFromClick = useCallback(
    (cmd: string) => {
      run(cmd);
      focusInput();
    },
    [run, focusInput]
  );

  const complete = () => {
    const value = input.replace(/^\s+/, "");
    const [name, ...rest] = value.split(/\s+/);
    let options: string[];
    let base: string;
    let partial: string;

    if (rest.length === 0) {
      options = VISIBLE_NAMES.filter((n) => n.startsWith(name.toLowerCase()));
      base = "";
      partial = name.toLowerCase();
    } else {
      const command = findCommand(name);
      const values = command?.completions?.(data) ?? [];
      partial = rest.join(" ").toLowerCase();
      options = values.filter((v) => v.startsWith(partial));
      base = `${name} `;
    }

    if (options.length === 1) {
      setInput(`${base}${options[0]} `);
    } else if (options.length > 1) {
      const prefix = sharedPrefix(options);
      if (prefix.length > partial.length) setInput(base + prefix);
      else
        print(
          value,
          <div className="flex flex-wrap gap-x-4 text-slate-300">
            {options.map((o) => (
              <Run key={o} cmd={`${base}${o}`}>{o}</Run>
            ))}
          </div>
        );
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      complete();
    } else if (e.key === "ArrowUp") {
      if (!past.length) return;
      e.preventDefault();
      const i = cursor === null ? past.length - 1 : Math.max(0, cursor - 1);
      setCursor(i);
      setInput(past[i]);
    } else if (e.key === "ArrowDown") {
      if (cursor === null) return;
      e.preventDefault();
      const i = cursor + 1;
      if (i >= past.length) {
        setCursor(null);
        setInput("");
      } else {
        setCursor(i);
        setInput(past[i]);
      }
    } else if (e.ctrlKey && e.key.toLowerCase() === "l") {
      e.preventDefault();
      clearScreen();
    } else if (e.ctrlKey && e.key.toLowerCase() === "d") {
      e.preventDefault();
      run("exit");
    } else if (e.ctrlKey && e.key.toLowerCase() === "c" && !window.getSelection()?.toString()) {
      e.preventDefault();
      print(`${input}^C`, null);
      setInput("");
      setCursor(null);
    }
  };

  const welcome = useMemo(
    () => (
      <div className="mb-6 space-y-1">
        <div className="text-emerald-400">Hi, I&apos;m Aime Serge: innovator, founder and researcher in Kigali.</div>
        <div className="text-slate-400">
          Explore my work by typing a command, or tap one. New here? Try <Run cmd="about" />,{" "}
          <Run cmd="ventures" /> or <Run cmd="help" />.
        </div>
        <div className="text-slate-500">
          <Run cmd="clear" /> wipes the screen, <Run cmd="exit" /> takes you back to the website.
        </div>
      </div>
    ),
    []
  );

  return (
    <RunContext.Provider value={runFromClick}>
      <div className="flex h-[60vh] min-h-[22rem] w-full max-w-4xl flex-col rounded-xl border border-slate-800 bg-slate-950/80 font-mono shadow-2xl backdrop-blur-md">
        {/* Terminal Header */}
        <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-900/50 px-4 py-3">
          <div className="flex gap-1.5" aria-hidden="true">
            <div className="h-3 w-3 rounded-full bg-red-500/80" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
          </div>
          <div className="ml-4 hidden items-center text-xs text-slate-400 sm:flex">
            <TerminalIcon className="mr-2 h-3 w-3" aria-hidden="true" />
            aimeserge: terminal
          </div>
          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={clearScreen}
              title="Clear the screen (Ctrl+L)"
              className="flex min-h-[2rem] items-center gap-1.5 rounded-md px-2.5 text-xs text-slate-400 transition hover:bg-slate-800 hover:text-white focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
            >
              <Eraser className="h-3.5 w-3.5" aria-hidden="true" />
              Clear
            </button>
            <button
              type="button"
              onClick={() => run("exit")}
              title="Leave the terminal (Ctrl+D)"
              className="flex min-h-[2rem] items-center gap-1.5 rounded-md px-2.5 text-xs text-slate-400 transition hover:bg-red-500/15 hover:text-red-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              Exit
            </button>
          </div>
        </div>

        {/* Terminal Body */}
        <div
          ref={bodyRef}
          className="flex-1 overflow-y-auto p-4 text-sm scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-700"
          onClick={() => {
            // Don't steal focus while the visitor is selecting text to copy.
            if (!window.getSelection()?.toString()) focusInput();
          }}
        >
          {welcome}

          <div role="log" aria-live="polite" aria-label="Terminal output">
            {entries.map((entry) => (
              <div key={entry.id} className="mb-4">
                <div className="flex flex-wrap text-slate-300">
                  <span className="mr-2 text-cyan-400" aria-hidden="true">{PROMPT}</span>
                  {entry.input}
                </div>
                {entry.output && <div className="mt-1 text-slate-400">{entry.output}</div>}
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              run(input);
            }}
            className="flex"
          >
            <label htmlFor="terminal-input" className="mr-2 shrink-0 text-cyan-400">
              <span aria-hidden="true">{PROMPT}</span>
              <span className="sr-only">Type a command, for example help</span>
            </label>
            <input
              id="terminal-input"
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setCursor(null);
              }}
              onKeyDown={onKeyDown}
              className="min-w-0 flex-1 bg-transparent text-slate-300 outline-none"
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              enterKeyHint="go"
            />
          </form>
        </div>

        {/* Quick commands */}
        <div className="flex gap-2 overflow-x-auto border-t border-slate-800 bg-slate-900/40 px-4 py-2 text-xs" aria-label="Quick commands">
          {QUICK.map((cmd) => (
            <button
              key={cmd}
              type="button"
              onClick={() => runFromClick(cmd)}
              className="shrink-0 rounded-md border border-slate-700 px-2.5 py-1 text-slate-300 transition hover:border-cyan-500/50 hover:text-cyan-400 focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>
    </RunContext.Provider>
  );
}
