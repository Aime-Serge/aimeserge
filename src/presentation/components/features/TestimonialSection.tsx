'use client';

import { Testimonial } from "@/core/domain/portfolio/types";
import { Quote, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface TestimonialSectionProps {
  testimonials: Testimonial[];
  title?: string;
  subtitle?: string;
}

export default function TestimonialSection({
  testimonials,
  title = "What Teams Say",
  subtitle = "Verification from collaborators and industry partners"
}: TestimonialSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!testimonials || testimonials.length === 0) return null;

  const active = testimonials[activeIndex];

  return (
    <section className="py-16 lg:py-24">
      <div className="mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
          {title}
        </h2>
        <p className="text-slate-400 text-lg max-w-2xl">
          {subtitle}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Main Testimonial Card */}
        <div className="relative p-8 lg:p-12 rounded-2xl border border-slate-700 bg-slate-900/40 backdrop-blur-sm">
          <div className="absolute top-6 right-6 text-cyan-500/20">
            <Quote className="h-8 w-8" />
          </div>

          <blockquote className="space-y-6">
            <p className="text-lg lg:text-xl text-slate-200 leading-relaxed font-light italic">
              "{active.quote}"
            </p>

            <div className="pt-4 border-t border-slate-700/50">
              <div className="flex items-start gap-4">
                {active.authorImage && (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex-shrink-0 flex items-center justify-center text-white font-bold text-sm">
                    {active.authorName.charAt(0)}
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-white">{active.authorName}</span>
                    {active.verified && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-slate-400 font-mono uppercase tracking-wider">
                    {active.authorRole} @ {active.authorCompany}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-300">
                      {active.context}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-400">
                      {new Date(active.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </blockquote>
        </div>

        {/* Testimonials Navigation */}
        <div className="space-y-3 flex flex-col">
          {testimonials.map((testimonial, idx) => (
            <button
              key={testimonial.id}
              onClick={() => setActiveIndex(idx)}
              className={`p-4 text-left rounded-lg border transition-all ${
                idx === activeIndex
                  ? "border-cyan-500/50 bg-cyan-500/10 ring-1 ring-cyan-500/30"
                  : "border-slate-700 bg-slate-900/40 hover:border-slate-600 hover:bg-slate-900/60"
              }`}
            >
              <div className="font-semibold text-sm text-white truncate">
                {testimonial.authorName}
              </div>
              <div className="text-xs text-slate-400 truncate">
                {testimonial.authorRole}
              </div>
              <div className="text-xs text-slate-500 mt-2 line-clamp-2">
                "{testimonial.quote.substring(0, 80)}..."
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Indicators */}
      <div className="mt-8 flex justify-center gap-2">
        {testimonials.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`h-2 rounded-full transition-all ${
              idx === activeIndex
                ? "w-8 bg-cyan-500"
                : "w-2 bg-slate-700 hover:bg-slate-600"
            }`}
            aria-label={`Show testimonial ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
