"use client";

import { CheckCircle2, TrendingUp, Users, Zap } from "lucide-react";
import Link from "next/link";

interface ProofSignal {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}

interface ProofBackedCTAProps {
  title: string;
  description: string;
  primaryCTA: {
    text: string;
    href: string;
  };
  secondaryCTA?: {
    text: string;
    href: string;
  };
  proofSignals: ProofSignal[];
  variant?: "hero" | "inline" | "featured";
}

export default function ProofBackedCTA({
  title,
  description,
  primaryCTA,
  secondaryCTA,
  proofSignals,
  variant = "hero"
}: ProofBackedCTAProps) {
  const containerClass = variant === "hero" 
    ? "rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-12 md:p-16"
    : variant === "featured"
    ? "rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-10 md:p-12"
    : "rounded-xl border border-slate-800/50 bg-slate-900/40 p-8";

  return (
    <div className={containerClass}>
      <div className="grid gap-12 lg:grid-cols-[1fr_1fr] items-center">
        {/* Left: CTA Content */}
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
              {title}
            </h2>
            <p className="text-lg text-slate-400 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Proof Signals - Compact */}
          <div className="space-y-3 pl-0 md:pl-0">
            {proofSignals.map((signal, idx) => (
              <div 
                key={idx}
                className={`flex items-center gap-3 text-sm ${
                  signal.highlight 
                    ? "text-emerald-400 font-semibold" 
                    : "text-slate-300"
                }`}
              >
                <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                  signal.highlight 
                    ? "bg-emerald-500/20" 
                    : "bg-slate-800/50"
                }`}>
                  {signal.icon}
                </div>
                <span><strong>{signal.value}</strong> {signal.label}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link
              href={primaryCTA.href}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-700 px-8 py-4 font-bold text-white transition hover:shadow-[0_0_20px_rgba(8,145,178,0.5)] hover:from-cyan-500 hover:to-cyan-600"
            >
              {primaryCTA.text}
              <TrendingUp className="h-4 w-4" />
            </Link>
            {secondaryCTA && (
              <Link
                href={secondaryCTA.href}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/30 px-8 py-4 font-bold text-slate-300 transition hover:bg-slate-800 hover:text-white hover:border-slate-600"
              >
                {secondaryCTA.text}
              </Link>
            )}
          </div>
        </div>

        {/* Right: Trust Metrics Grid */}
        <div className="hidden lg:grid grid-cols-2 gap-6">
          {proofSignals.slice(0, 4).map((signal, idx) => (
            <div
              key={idx}
              className={`rounded-xl p-5 ${
                signal.highlight
                  ? "border border-emerald-500/30 bg-emerald-500/10"
                  : "border border-slate-800/50 bg-slate-800/20"
              }`}
            >
              <div className={`mb-2 ${signal.highlight ? "text-emerald-400" : "text-cyan-400"}`}>
                {signal.icon}
              </div>
              <div className={`text-lg font-bold ${signal.highlight ? "text-emerald-400" : "text-white"}`}>
                {signal.value}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {signal.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
