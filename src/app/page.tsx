import Link from "next/link";
import { Terminal, Shield, Cloud, Cpu, ArrowRight, CheckCircle2, Globe, TrendingUp, Users, Award } from "lucide-react";
import ProofBackedCTA from "@/presentation/components/features/ProofBackedCTA";

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Aime Serge UKOBIZABA",
    "jobTitle": "Senior Software Engineer",
    "url": "https://aimesergeonline.vercel.app",
    "sameAs": [
      "https://github.com/AimeSerge",
      "https://linkedin.com/in/aimeserge"
    ],
    "knowsAbout": ["Cybersecurity", "Cloud Architecture", "Artificial Intelligence", "Full-Stack Development"]
  };

  return (
    <div className="flex flex-col items-center">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero Section */}
      <section aria-label="Introduction" className="relative w-full overflow-hidden py-20 lg:py-32">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center text-center">
            {/* Professional Status Badge */}
            <div className="mb-8 flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-xs font-mono text-cyan-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500"></span>
              </span>
              Senior Software Engineer · Google Cloud Certified
            </div>

            <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl leading-[1.1]">
              Building <span className="text-cyan-500">Secure</span>, <span className="text-emerald-500">Scalable</span> & AI-Powered Infrastructure
            </h1>

            <p className="mt-8 max-w-2xl text-lg text-slate-400">
              I design and build production systems that prioritize security, performance, and reliability. 
              Experienced in cloud architecture, AI integration, and scaling systems for real-world impact.
            </p>

            <div className="mt-12 flex flex-wrap justify-center gap-4">
              <Link
                href="/projects"
                className="group flex items-center gap-2 rounded-xl bg-cyan-600 px-8 py-4 font-bold text-white transition hover:bg-cyan-700 hover:shadow-[0_0_20px_rgba(8,145,178,0.4)]"
              >
                View My Work
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/contact"
                className="flex items-center gap-2 rounded-xl border border-emerald-600 bg-emerald-600/10 px-8 py-4 font-bold text-emerald-400 transition hover:bg-emerald-600/20"
              >
                Let&apos;s Talk
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Me / Mission Section */}
      <section id="about" aria-labelledby="about-heading" className="container mx-auto px-6 py-24 border-y border-slate-800/50">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div className="space-y-6">
            <h2 id="about-heading" className="text-3xl font-bold text-white">Systems Architect & Security Engineer</h2>
            <p className="text-slate-400 leading-relaxed text-lg">
              I'm <span className="text-white font-medium">Aime Serge UKOBIZABA</span>, a systems architect focused on building secure, scalable backend systems and cloud infrastructure that solves real problems at national scale.
            </p>
            <p className="text-slate-400 leading-relaxed text-lg">
              My expertise spans <span className="text-cyan-400">security-first architecture</span>, <span className="text-emerald-400">modern AI integration</span>, and working on impactful problems—including Rwanda's urban transport logistics and infrastructure modernization.
            </p>
            
            <div className="grid gap-4 sm:grid-cols-2 mt-8">
              {[
                "Security by design",
                "Scalable architecture",
                "Production-ready code",
                "AI-powered systems"
              ].map(point => (
                <div key={point} className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span className="text-sm font-mono">{point}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative">
      {/* Engineering Approach Box */}
             <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 backdrop-blur-sm">
                <h3 className="text-xl font-bold text-white mb-6">Engineering Approach</h3>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-500">
                      <Shield className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Security-First</h4>
                      <p className="text-sm text-slate-500">Encryption, hardened IAM, and threat modeling built into design.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                      <Cloud className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Cloud-Native Scale</h4>
                      <p className="text-sm text-slate-500">Serverless, containerized, and auto-scaling for global reach.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                      <Cpu className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">AI Integration</h4>
                      <p className="text-sm text-slate-500">Semantic search, RAG, and LLMs for intelligent systems.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                      <Terminal className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Software Craftsmanship</h4>
                      <p className="text-sm text-slate-500">Applying DS&A, Clean Code, and System Design patterns.</p>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Software Engineering Demonstrations Section */}
      <section id="expertise" aria-labelledby="expertise-heading" className="container mx-auto px-6 py-24 bg-slate-900/10 border-y border-slate-800/30">
        <div className="text-center mb-16">
          <h2 id="expertise-heading" className="text-3xl font-bold text-white mb-4">Software Engineering <span className="text-cyan-500">Demonstrations</span></h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Beyond specialized tools, I apply rigorous software engineering principles to ensure system reliability and code quality.</p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              title: "System Design",
              desc: "Designing high-availability systems with Load Balancers, Caching, and Microservices.",
              icon: <Globe className="h-8 w-8 text-cyan-400" />,
              skills: ["Microservices", "System Design Patterns", "Distributed Systems"]
            },
            {
              title: "Algorithms & Logic",
              desc: "Expertise in Data Structures and Algorithms for optimized data processing.",
              icon: <Cpu className="h-8 w-8 text-emerald-400" />,
              skills: ["Complexity Analysis", "Graph Theory", "Optimization"]
            },
            {
              title: "DevOps & CI/CD",
              desc: "Automating the software lifecycle with infrastructure as code and CI/CD pipelines.",
              icon: <Cloud className="h-8 w-8 text-purple-400" />,
              skills: ["Docker", "Kubernetes", "GitHub Actions"]
            }
          ].map((demo, idx) => (
            <div key={idx} className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-8 transition-all hover:border-cyan-500/50 hover:-translate-y-1">
              <div className="mb-6">{demo.icon}</div>
              <h3 className="text-xl font-bold text-white mb-3">{demo.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">{demo.desc}</p>
              <div className="flex flex-wrap gap-2">
                {demo.skills.map(s => (
                  <span key={s} className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section - Proof-Backed Conversion */}
      <section className="container mx-auto px-6 py-24 border-t border-slate-800/50">
        <ProofBackedCTA
          title="Why Teams Choose Me"
          description="Backed by verified results and proven expertise in delivering secure, scalable systems that generate real business impact."
          primaryCTA={{
            text: "View Case Studies",
            href: "/projects"
          }}
          secondaryCTA={{
            text: "Let's Discuss Your Project",
            href: "/contact"
          }}
          proofSignals={[
            {
              icon: <TrendingUp className="h-5 w-5" />,
              label: "Average wait time reduction in deployed systems",
              value: "18%",
              highlight: true
            },
            {
              icon: <Award className="h-5 w-5" />,
              label: "Verified testimonials from technical partners",
              value: "4/4",
            },
            {
              icon: <Users className="h-5 w-5" />,
              label: "Monthly visitors to this platform",
              value: "1,248+",
            },
            {
              icon: <Globe className="h-5 w-5" />,
              label: "Security audit score (A+ grade)",
              value: "A+",
              highlight: true
            },
            {
              icon: <CheckCircle2 className="h-5 w-5" />,
              label: "Production systems deployed",
              value: "3",
            },
            {
              icon: <Cloud className="h-5 w-5" />,
              label: "Multi-region cloud architecture experience",
              value: "GCP+AWS",
            }
          ]}
          variant="featured"
        />
      </section>
    </div>
  );
}
