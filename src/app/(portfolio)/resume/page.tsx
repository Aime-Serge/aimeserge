import { Download, ExternalLink, FileText, CheckCircle, GraduationCap, Briefcase, Cloud, Calendar, Building2 } from "lucide-react";
import BadgeShowcase from "@/presentation/components/features/BadgeShowcase";
import { getCertificates, getLatestResume } from "@/domain/portfolio/queries";

export const metadata = {
  title: "Resume | Aime Serge UKOBIZABA",
  description: "Software Engineering, Google Cloud, and AI specialization of Aime Serge.",
};

const skillMatrix = [
  { name: "Backend Engineering", tools: "Node.js, Python (Django/DRF), REST APIs", level: 95 },
  { name: "Cloud & DevOps", tools: "Google Cloud Platform, Vercel, CI/CD", level: 88 },
  { name: "Cybersecurity", tools: "IAM, API Hardening, Zero-Trust", level: 82 },
  { name: "Frontend Development", tools: "React, Next.js, Tailwind CSS", level: 90 },
  { name: "AI & ML", tools: "Vertex AI, LLM Prompting, MLOps", level: 85 }
];

export default async function ResumePage() {
  const certificates = await getCertificates();
  const latestResumeUrl = await getLatestResume();

  return (
    <div className="container mx-auto px-6 py-12 lg:py-20">
      <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between mb-16">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Professional <span className="text-cyan-500">Blueprint</span>
          </h1>
          <p className="mt-4 text-slate-400 text-lg">ALX Alumni | Google Cloud Certified | AI Researcher</p>
        </div>
        <a 
          href={latestResumeUrl || "/uploads/AimeSergeUkobizabaResume.pdf"} 
          download
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-xl bg-cyan-600 px-6 py-3 font-bold text-white transition hover:bg-cyan-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
        >
          <Download className="h-5 w-5" />
          Download PDF CV
        </a>
      </div>

      <div className="grid gap-12 lg:grid-cols-[1fr_380px]">
        <div className="space-y-16">
          {/* Experience */}
          <section aria-labelledby="experience-title">
            <h2 id="experience-title" className="mb-10 flex items-center gap-3 text-2xl font-bold text-white uppercase tracking-wider font-mono">
              <Briefcase className="h-6 w-6 text-cyan-500" aria-hidden="true" />
              Technical Experience
            </h2>
            <div className="space-y-12 border-l border-slate-800 ml-3 pl-8">
              <article className="relative">
                <div className="absolute -left-[41px] top-1 h-4 w-4 rounded-full border-4 border-slate-950 bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                <h3 className="text-xl font-bold text-white">Software Engineer</h3>
                <p className="text-cyan-500 font-mono text-sm">ALX Rwanda / ALX Ventures Rwanda Ambassador | 2026 - Present</p>
                <ul className="mt-4 space-y-2 text-slate-400 text-sm leading-relaxed list-disc ml-4">
                   <li>Building secure and scalable backend systems and APIs for startups.</li>
                   <li>Developing full-stack applications with Next.js and Tailwind CSS.</li>
                   <li>Integrating AI agents and intelligent systems into production workflows.</li>
                   <li>Transitioning to a Linux-based (Ubuntu) production environment for advanced SDLC management.</li>
                </ul>
              </article>

              <article className="relative">
                <div className="absolute -left-[41px] top-1 h-4 w-4 rounded-full border-4 border-slate-950 bg-slate-700" />
                <h3 className="text-xl font-bold text-white">Technical Researcher</h3>
                <p className="text-slate-500 font-mono text-sm">Independent Projects | 2022 - 2023</p>
                <p className="mt-3 text-slate-400 text-sm">Focused on IoT solutions for urban mobility (Flex Transport Model) and AI ethics/transparency in African digital sectors.</p>
              </article>
            </div>
          </section>

          {/* Education & Certs */}
          <section aria-labelledby="edu-title">
            <h2 id="edu-title" className="mb-10 flex items-center gap-3 text-2xl font-bold text-white uppercase tracking-wider font-mono">
              <GraduationCap className="h-6 w-6 text-emerald-500" aria-hidden="true" />
              Education & ALX Credentials
            </h2>
            <div className="grid gap-6">
              <div className="grid gap-6 sm:grid-cols-2 mb-10">
                <article className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
                  <h4 className="font-bold text-white text-sm">ALX Software Engineering</h4>
                  <p className="text-xs text-emerald-500 font-mono mt-1">Professional Development | 2023 - 2024</p>
                  <p className="text-xs text-slate-500 mt-2">Intensive 12-month program covering Foundations, Backend, and Specialized AI tracks.</p>
                </article>
                <article className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
                  <h4 className="font-bold text-white text-sm">University of Rwanda</h4>
                  <p className="text-xs text-emerald-500 font-mono mt-1">BSc Computer Science | In Progress</p>
                </article>
              </div>

              {/* ALX Verified Certificates (LinkedIn Format) */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <h4 className="font-bold text-white text-lg flex items-center gap-2">
                     <CheckCircle className="h-5 w-5 text-cyan-400" aria-hidden="true" />
                     Verified Credentials
                   </h4>
                </div>
                
                <div className="grid gap-6">
                  {certificates.map((cert, i) => (
                    <article key={i} className="group relative rounded-2xl border border-slate-800 bg-[#010409] p-6 transition-all hover:border-cyan-500/50">
                       <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div className="space-y-3">
                             <h5 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">{cert.name}</h5>
                             
                             <div className="flex flex-wrap items-center gap-y-2 gap-x-6">
                                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                                   <Building2 className="h-3.5 w-3.5 text-cyan-500" />
                                   {cert.provider}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                                   <Calendar className="h-3.5 w-3.5 text-cyan-500" />
                                   Issued: {cert.issueDate} {cert.expiryDate ? `· Expires: ${cert.expiryDate}` : '· No Expiry'}
                                </div>
                             </div>

                             <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
                                {cert.description}
                             </p>
                          </div>

                          <div className="flex flex-row md:flex-col gap-2">
                             {cert.verifyUrl && (
                               <a 
                                 href={cert.verifyUrl} 
                                 target="_blank" 
                                 rel="noopener noreferrer"
                                 className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-slate-300 transition hover:bg-slate-800 hover:text-white border border-slate-800"
                               >
                                 Verify <ExternalLink className="h-3 w-3" />
                               </a>
                             )}
                             {cert.pdfUrl && (
                               <a 
                                 href={cert.pdfUrl} 
                                 target="_blank" 
                                 rel="noopener noreferrer"
                                 className="flex items-center justify-center gap-2 rounded-lg bg-cyan-600/10 px-4 py-2 text-xs font-bold text-cyan-500 transition hover:bg-cyan-600 hover:text-white"
                               >
                                 PDF <FileText className="h-3 w-3" />
                               </a>
                             )}
                          </div>
                       </div>
                    </article>
                  ))}
                </div>
              </div>

              {/* Google Cloud Badges Section */}
              <section className="mt-12 space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-lg flex items-center gap-2 font-mono uppercase tracking-widest">
                    <Cloud className="h-5 w-5 text-emerald-400" aria-hidden="true" />
                    Cloud Skills Matrix
                  </h4>
                  <a 
                    href="https://www.skills.google/public_profiles/ea12c24b-9b3d-43a0-b983-96cd33bd7b40" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[10px] font-mono text-emerald-500 hover:text-emerald-400 transition-colors uppercase tracking-widest flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded px-1"
                  >
                    Live Profile <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                
                <BadgeShowcase />
              </section>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-8">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm sticky top-24">
            <h3 className="mb-6 text-sm font-bold uppercase tracking-widest text-white border-b border-slate-800 pb-2">Skill Matrix</h3>
            <div className="space-y-6">
              {skillMatrix.map(skill => (
                <div key={skill.name} className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-300">{skill.name}</span>
                    <span className="text-cyan-500" aria-label={`${skill.level} percent proficiency`}>{skill.level}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-800" role="progressbar" aria-valuenow={skill.level} aria-valuemin={0} aria-valuemax={100}>
                    <div 
                      className="h-full rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.4)] transition-all duration-1000" 
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono">{skill.tools}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
