"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Terminal, Shield, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/infrastructure/security/headers";
import GlobalSearch from "@/presentation/components/features/GlobalSearch";

const navItems = [
  { name: "Projects", href: "/projects" },
  { name: "Research", href: "/research" },
  { name: "Blog", href: "/blog" },
  { name: "Resume", href: "/resume" },
  { name: "Contact", href: "/contact" },
];

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Handle ESC key to close mobile menu
  useEffect(() => {
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
      }
    }

    if (isMenuOpen) {
      document.addEventListener("keydown", handleEscapeKey);
      // Prevent body scroll when menu is open on mobile
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/50 bg-slate-950/70 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <Link 
          href="/" 
          className="flex items-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-lg"
          aria-label="Home"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-600/20 text-cyan-500 transition-colors group-hover:bg-cyan-600 group-hover:text-white">
            <Shield className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white font-mono">
            AIME<span className="text-cyan-500">_</span>SERGE<span className="text-cyan-500">_</span>UKOBIZABA
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-6">
          <GlobalSearch className="w-[320px]" />
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              className={cn(
                "text-sm font-medium transition-colors hover:text-cyan-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded px-1",
                pathname === item.href ? "text-cyan-400" : "text-slate-400"
              )}
            >
              {item.name}
            </Link>
          ))}
          <Link
            href="/terminal"
            className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-1.5 text-xs font-mono text-slate-300 transition hover:bg-slate-700 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
          >
            <Terminal className="h-3.5 w-3.5" />
            Terminal
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <button
          className={cn(
            "md:hidden p-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500",
            isMenuOpen 
              ? "bg-cyan-600/20 text-cyan-400 border border-cyan-600/30" 
              : "text-slate-400 hover:text-white hover:bg-slate-900/50"
          )}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Nav - with smooth animation */}
      {isMenuOpen && (
        <nav 
          id="mobile-menu"
          aria-label="Mobile Navigation"
          className="relative z-40 md:hidden animate-in duration-300 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md px-6 py-4 space-y-3"
        >
          {/* Search on mobile */}
          <div className="mb-4">
            <GlobalSearch
              onNavigate={() => setIsMenuOpen(false)}
              className="w-full"
              placeholder="Search..."
            />
          </div>

          {/* Navigation items */}
          <div className="space-y-2 border-t border-slate-800/50 pt-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                aria-current={pathname === item.href ? "page" : undefined}
                className={cn(
                  "block px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500",
                  pathname === item.href 
                    ? "text-white bg-cyan-600/20 border border-cyan-600/30" 
                    : "text-slate-400 hover:text-white hover:bg-slate-900/50 active:bg-slate-800"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Terminal link */}
          <div className="border-t border-slate-800/50 pt-4">
            <Link
              href="/terminal"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-mono text-cyan-400 hover:text-cyan-300 hover:bg-slate-900/50 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
            >
              <Terminal className="h-4 w-4" />
              Terminal
            </Link>
          </div>
        </nav>
      )}

      {/* Overlay - close menu when clicked */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 md:hidden z-30 bg-black/40 animate-fade-in duration-300"
          onClick={() => setIsMenuOpen(false)}
          role="presentation"
          aria-hidden="true"
        />
      )}
    </header>
  );
}
