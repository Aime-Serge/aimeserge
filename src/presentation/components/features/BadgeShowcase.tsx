"use client";

import { motion } from "framer-motion";
import { BadgeCheck, Brain, Cloud, Code, ExternalLink, Building2, Calendar } from "lucide-react";

interface Badge {
  name: string;
  provider: string;
  issueDate: string;
  expiryDate?: string | null;
  id?: string;
  description: string;
  href?: string;
}

interface BadgeCategory {
  title: string;
  icon: React.ReactNode;
  badges: Badge[];
}

const badgeCategories: BadgeCategory[] = [
  {
    title: "Generative AI & LLMs",
    icon: <Brain className="h-5 w-5 text-purple-400" aria-hidden="true" />,
    badges: [
      { 
        name: "Vertex AI: Getting Started", 
        provider: "Google Cloud", 
        issueDate: "Feb 2024", 
        description: "Hands-on mastery of Vertex AI workflows and model deployment.",
        href: "#" 
      },
      { 
        name: "Generative AI Fundamentals", 
        provider: "Google Cloud", 
        issueDate: "Jan 2024", 
        description: "Core concepts of GenAI, LLMs, and responsible AI implementation.",
        href: "#" 
      }
    ]
  },
  {
    title: "MLOps & Data Science",
    icon: <BadgeCheck className="h-5 w-5 text-cyan-400" aria-hidden="true" />,
    badges: [
      { 
        name: "MLOps Fundamentals", 
        provider: "Google Cloud", 
        issueDate: "Mar 2024", 
        description: "Standardizing and automating machine learning system lifecycles.",
        href: "#" 
      }
    ]
  },
  {
    title: "Cloud Infrastructure & Security",
    icon: <Cloud className="h-5 w-5 text-emerald-400" aria-hidden="true" />,
    badges: [
      { 
        name: "Protecting GCP with Model Armor", 
        provider: "Google Cloud", 
        issueDate: "Apr 2024", 
        description: "Implementing advanced security guardrails for LLM applications.",
        href: "#" 
      }
    ]
  },
  {
    title: "Advanced SDLC & AI Tools",
    icon: <Code className="h-5 w-5 text-amber-400" aria-hidden="true" />,
    badges: [
      { 
        name: "Gemini for Developers", 
        provider: "Google Cloud", 
        issueDate: "Feb 2024", 
        description: "Accelerating software engineering with Gemini-powered AI assistants.",
        href: "#" 
      }
    ]
  }
];

export default function BadgeShowcase() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {badgeCategories.map((category, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-slate-800 bg-[#010409] p-6 backdrop-blur-sm transition-all hover:border-cyan-500/30"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900/50">
              {category.icon}
            </div>
            <h3 className="font-bold text-white tracking-tight font-mono uppercase text-sm">{category.title}</h3>
          </div>
          
          <div className="space-y-6">
            {category.badges.map((badge, bIdx) => (
              <div key={bIdx} className="space-y-2 group">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">
                    {badge.name}
                  </h4>
                  {badge.href && (
                    <a href={badge.href} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-cyan-500 transition-colors">
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                    <Building2 className="h-3 w-3 text-cyan-500/50" />
                    {badge.provider}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                    <Calendar className="h-3 w-3 text-cyan-500/50" />
                    {badge.issueDate}
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed italic">
                  {badge.description}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
