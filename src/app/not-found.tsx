import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SITE } from "@/config/site";

export const metadata = {
  title: "Page not found",
  robots: { index: false },
};

const LINKS = [
  { href: "/projects", label: "Ventures and projects", note: "INEZA AI, DukaAI and more" },
  { href: "/research", label: "Research for impact", note: "Climate, health, business and safety" },
  { href: "/resume", label: "Resume", note: "Experience, education and certificates" },
  { href: "/contact", label: "Contact", note: SITE.responseTime },
];

export default function NotFound() {
  return (
    <div className="container mx-auto max-w-3xl px-6 py-24 text-center">
      <p className="text-sm font-semibold text-cyan-400">Page not found</p>
      <h1 className="mt-4 text-4xl font-bold text-white sm:text-5xl">This page doesn&apos;t exist</h1>
      <p className="mx-auto mt-6 max-w-xl text-lg text-slate-400">
        The link may be old or mistyped. Here are the main places to go instead.
      </p>

      <ul className="mt-12 grid gap-4 text-left sm:grid-cols-2">
        {LINKS.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="group flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-cyan-500/50"
            >
              <span className="inline-flex items-center gap-2 font-semibold text-white group-hover:text-cyan-300">
                {l.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="mt-1 text-sm text-slate-500">{l.note}</span>
            </Link>
          </li>
        ))}
      </ul>

      <Link href="/" className="mt-10 inline-flex font-semibold text-cyan-400 hover:text-cyan-300">
        Back to the homepage
      </Link>
    </div>
  );
}
