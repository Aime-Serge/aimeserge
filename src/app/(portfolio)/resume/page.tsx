import { Download, ExternalLink, FileText, CheckCircle, GraduationCap, Briefcase, Cloud, Calendar, Building2, MapPin, Award, Trophy } from "lucide-react";
import BadgeShowcase from "@/presentation/components/features/BadgeShowcase";
import TestimonialSection from "@/presentation/components/features/TestimonialSection";
import { getCertificates, getLatestResume, getExperiences, getEducations, getAchievements } from "@/core/domain/portfolio/queries";
import { testimonials } from "@/core/domain/portfolio/constants";
import { formatDuration } from "@/infrastructure/utils/dateUtils";
import Image from "next/image";
import { cn } from "@/infrastructure/security/headers";
import { Experience } from "@/core/domain/portfolio/types";

export const metadata = {
  title: "Professional Blueprint | Aime Serge UKOBIZABA",
  description: "Senior Software Engineer, Google Cloud Architect, and AI Specialist with 5+ years deploying secure, scalable systems. AWS & GCP certified. Expertise: Cloud Architecture, Zero-Trust Security, ML Systems, Full-Stack Engineering. Verifiable credentials and peer-validated achievements.",
};

const skillMatrix = [
  { name: "Backend Engineering", tools: "Node.js, Python (Django/DRF), REST APIs", level: 95 },
  { name: "Cloud & DevOps", tools: "Google Cloud Platform, Vercel, CI/CD", level: 88 },
  { name: "Cybersecurity", tools: "IAM, API Hardening, Zero-Trust", level: 82 },
  { name: "Frontend Development", tools: "React, Next.js, Tailwind CSS", level: 90 },
  { name: "AI & ML", tools: "Vertex AI, LLM Prompting, MLOps", level: 85 }
];

export default async function ResumePage() {
  const [certificates, experiences, educations, achievements, latestResumeUrl] = await Promise.all([
    getCertificates(),
    getExperiences(),
    getEducations(),
    getAchievements(),
    getLatestResume()
  ]);

  // Group experiences by company (LinkedIn-style)
  const groupedExperiences = experiences.reduce((acc, exp) => {
    const companyId = exp.companyId;
    if (!acc[companyId]) {
      acc[companyId] = {
        company: exp.company!,
        roles: []
      };
    }
    acc[companyId].roles.push(exp);
    return acc;
  }, {} as Record<string, { company: any, roles: Experience[] }>);

  return (
    <div className="container mx-auto px-6 py-12 lg:py-20">
      <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between mb-20">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Professional <span className="text-cyan-500">Blueprint</span>
          </h1>
          <p className="mt-6 text-slate-400 text-lg md:text-xl max-w-2xl leading-relaxed">
            Architecting secure, scalable AI systems and cloud infrastructure. Verifiable expertise in high-performance computing.
          </p>
          
          {/* Key Metrics Highlights */}
          <div className="mt-8 grid grid-cols-3 gap-4 md:gap-6">
            <div className="p-4 rounded-lg border border-cyan-500/20 bg-cyan-500/5">
              <div className="text-lg font-bold text-cyan-400">5+</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider">Years Experience</div>
            </div>
            <div className="p-4 rounded-lg border border-cyan-500/20 bg-cyan-500/5">
              <div className="text-lg font-bold text-cyan-400">10+</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider">Verified Certs</div>
            </div>
            <div className="p-4 rounded-lg border border-cyan-500/20 bg-cyan-500/5">
              <div className="text-lg font-bold text-cyan-400">100%</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider">Vetted Profile</div>
            </div>
          </div>
        </div>
        <a 
          href={latestResumeUrl || "/uploads/Aime_Serge_Ukobizaba_CV_01-3.pdf"} 
          download
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-8 py-4 font-bold text-white transition hover:bg-cyan-500 hover:shadow-[0_0_20px_rgba(8,145,178,0.4)] shadow-lg"
        >
          <Download className="h-5 w-5" />
          DOWNLOAD_CV_NODE
        </a>
      </div>

      <div className="grid gap-16 lg:grid-cols-[1fr_380px]">
        <div className="space-y-24">
          
          {/* Experience Section */}
          <section aria-labelledby="experience-title">
            <div className="flex items-center gap-4 mb-12">
               <div className="h-10 w-10 rounded-xl bg-cyan-600/10 flex items-center justify-center border border-cyan-500/20">
                  <Briefcase className="h-5 w-5 text-cyan-500" />
               </div>
               <h2 id="experience-title" className="text-2xl font-bold text-white uppercase tracking-tighter">Technical_Experience</h2>
            </div>

            <div className="space-y-16">
              {Object.values(groupedExperiences).map((group, idx) => (
                <div key={idx} className="relative pl-12 md:pl-20">
                  {/* Company Header */}
                  <div className="absolute left-0 top-0 h-10 w-10 md:h-14 md:w-14 rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
                    {group.company.logoUrl ? (
                      <Image src={group.company.logoUrl} alt={group.company.name} fill className="object-cover" />
                    ) : (
                      <Building2 className="h-full w-full p-2 text-slate-700" />
                    )}
                  </div>
                  
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-white leading-none">{group.company.name}</h3>
                    <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest font-mono">Organization Node // Verified</p>
                  </div>

                  {/* Roles Timeline */}
                  <div className="space-y-12 border-l-2 border-slate-800 ml-5 md:ml-7 pl-8 md:pl-12">
                    {group.roles.map((role, rIdx) => (
                      <article key={role.id} className="relative">
                        {/* Connecting node dot */}
                        <div className="absolute -left-[41px] md:-left-[57px] top-1.5 h-4 w-4 rounded-full border-4 border-slate-950 bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.6)]" />
                        
                        <div>
                          <div className="flex items-center gap-3">
                            <h4 className="text-lg font-bold text-slate-200">{role.title}</h4>
                            {!role.endDate && (
                              <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                            <span className="text-cyan-500 font-bold">{role.employmentType.replace('_', ' ')}</span>
                            <span>•</span>
                            <span>{formatDuration(role.startDate, role.endDate)}</span>
                          </div>
                          {role.location && (
                            <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-600 uppercase font-mono">
                               <MapPin className="h-3 w-3" /> {role.location} ({role.locationType})
                            </div>
                          )}

                          <div className="mt-6 text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">
                            {role.description}
                          </div>
                          
                          {/* Impact Highlights */}
                          {role.description && role.description.includes('•') && (
                            <div className="mt-4 space-y-2 ml-4 border-l border-cyan-500/30 pl-4">
                              {role.description
                                .split('•')
                                .slice(0, 3)
                                .filter(line => line.trim())
                                .map((impact, idx) => (
                                  <div key={idx} className="flex gap-2 text-xs text-cyan-400">
                                    <span className="text-cyan-500 font-bold mt-0.5">▸</span>
                                    <span>{impact.trim()}</span>
                                  </div>
                                ))}
                            </div>
                          )}

                          {role.skillsUsed && role.skillsUsed.length > 0 && (
                            <div className="mt-6 flex flex-wrap gap-2">
                              {role.skillsUsed.map(skill => (
                                <span key={skill} className="px-2 py-0.5 rounded-md bg-slate-800/50 border border-slate-700 text-[10px] font-mono text-slate-500">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Education Section */}
          <section aria-labelledby="edu-title">
            <div className="flex items-center gap-4 mb-12">
               <div className="h-10 w-10 rounded-xl bg-emerald-600/10 flex items-center justify-center border border-emerald-500/20">
                  <GraduationCap className="h-5 w-5 text-emerald-500" />
               </div>
               <h2 id="edu-title" className="text-2xl font-bold text-white uppercase tracking-tighter">Academic_Foundations</h2>
            </div>

            <div className="grid gap-8">
               {educations.map(edu => (
                 <article key={edu.id} className="group relative rounded-3xl border border-slate-800 bg-slate-900/40 p-8 transition-all hover:border-emerald-500/30">
                    <div className="flex flex-col md:flex-row gap-6">
                       <div className="h-16 w-16 rounded-2xl border border-slate-800 bg-slate-950 flex items-center justify-center shrink-0 shadow-lg overflow-hidden">
                          {edu.institution?.logoUrl ? (
                             <Image src={edu.institution.logoUrl} alt={edu.institution.name} fill className="object-cover" />
                          ) : (
                             <Building2 className="h-8 w-8 text-slate-800" />
                          )}
                       </div>
                       <div className="space-y-4 flex-1">
                          <div>
                             <h4 className="text-xl font-bold text-white">{edu.institution?.name}</h4>
                             <p className="text-emerald-500 font-bold text-sm mt-1">{edu.degree} • {edu.fieldOfStudy}</p>
                          </div>
                          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                             Graduation: {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Ongoing'} {edu.grade ? `• Grade: ${edu.grade}` : ''}
                          </p>
                          {edu.activities && (
                            <p className="text-xs text-slate-400 italic">
                               <span className="font-bold text-slate-500 not-italic">Activities:</span> {edu.activities}
                            </p>
                          )}
                          
                          {/* Relevant Coursework Tags */}
                          <div className="flex flex-wrap gap-2 pt-2">
                            {edu.fieldOfStudy?.includes('Computer') && (
                              <>
                                <span className="px-2 py-1 rounded-md bg-emerald-600/10 border border-emerald-500/30 text-[9px] font-mono text-emerald-500 uppercase tracking-wider">Data Structures</span>
                                <span className="px-2 py-1 rounded-md bg-emerald-600/10 border border-emerald-500/30 text-[9px] font-mono text-emerald-500 uppercase tracking-wider">Algorithms</span>
                                <span className="px-2 py-1 rounded-md bg-emerald-600/10 border border-emerald-500/30 text-[9px] font-mono text-emerald-500 uppercase tracking-wider">Database Systems</span>
                                <span className="px-2 py-1 rounded-md bg-emerald-600/10 border border-emerald-500/30 text-[9px] font-mono text-emerald-500 uppercase tracking-wider">Software Engineering</span>
                                <span className="px-2 py-1 rounded-md bg-emerald-600/10 border border-emerald-500/30 text-[9px] font-mono text-emerald-500 uppercase tracking-wider">Distributed Systems</span>
                                <span className="px-2 py-1 rounded-md bg-emerald-600/10 border border-emerald-500/30 text-[9px] font-mono text-emerald-500 uppercase tracking-wider">Network Security</span>
                              </>
                            )}
                            {edu.fieldOfStudy?.includes('Information') && (
                              <>
                                <span className="px-2 py-1 rounded-md bg-cyan-600/10 border border-cyan-500/30 text-[9px] font-mono text-cyan-500 uppercase tracking-wider">Cloud Architecture</span>
                                <span className="px-2 py-1 rounded-md bg-cyan-600/10 border border-cyan-500/30 text-[9px] font-mono text-cyan-500 uppercase tracking-wider">Information Security</span>
                                <span className="px-2 py-1 rounded-md bg-cyan-600/10 border border-cyan-500/30 text-[9px] font-mono text-cyan-500 uppercase tracking-wider">IAM & Zero Trust</span>
                                <span className="px-2 py-1 rounded-md bg-cyan-600/10 border border-cyan-500/30 text-[9px] font-mono text-cyan-500 uppercase tracking-wider">Systems Administration</span>
                              </>
                            )}
                            {edu.fieldOfStudy?.includes('Business') && (
                              <>
                                <span className="px-2 py-1 rounded-md bg-emerald-600/10 border border-emerald-500/30 text-[9px] font-mono text-emerald-500 uppercase tracking-wider">Project Management</span>
                                <span className="px-2 py-1 rounded-md bg-emerald-600/10 border border-emerald-500/30 text-[9px] font-mono text-emerald-500 uppercase tracking-wider">Strategic Planning</span>
                                <span className="px-2 py-1 rounded-md bg-emerald-600/10 border border-emerald-500/30 text-[9px] font-mono text-emerald-500 uppercase tracking-wider">Technology Leadership</span>
                              </>
                            )}
                          </div>
                       </div>
                    </div>
                 </article>
               ))}
            </div>
          </section>

          {/* Licenses & Certifications */}
          <section aria-labelledby="certs-title">
            <div className="flex items-center gap-4 mb-12">
               <div className="h-10 w-10 rounded-xl bg-cyan-600/10 flex items-center justify-center border border-cyan-500/20">
                  <Award className="h-5 w-5 text-cyan-500" />
               </div>
               <h2 id="certs-title" className="text-2xl font-bold text-white uppercase tracking-tighter">Verified_Credentials</h2>
            </div>

            {/* Organize certificates by competency area */}
            {certificates.length > 0 && (
              <div className="space-y-12">
                {/* Cloud Architecture Certifications */}
                {certificates.filter(c => c.name.includes('Cloud') || c.name.includes('Associate') || c.name.includes('Professional')).length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <Cloud className="h-4 w-4" /> Cloud Architecture
                    </h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      {certificates.filter(c => c.name.includes('Cloud') || c.name.includes('Associate') || c.name.includes('Professional')).map((cert) => (
                        <article key={cert.id} className="flex flex-col h-full rounded-2xl border border-slate-800 bg-slate-950 p-6 transition-all hover:border-cyan-500/30 group">
                          <div className="flex items-start justify-between gap-4 mb-4">
                             <div className="h-12 w-12 rounded-xl border border-slate-800 bg-slate-900 flex items-center justify-center shrink-0">
                                {cert.issuer?.logoUrl ? (
                                  <Image src={cert.issuer.logoUrl} alt={cert.provider} fill className="object-cover" />
                                ) : (
                                  <CheckCircle className="h-6 w-6 text-cyan-900" />
                                )}
                             </div>
                             <div className="flex flex-wrap gap-2">
                                {cert.verifyUrl && (
                                  <a href={cert.verifyUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-900 text-slate-500 hover:text-cyan-400 border border-slate-800 transition-colors" title="Verify Online">
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                )}
                                {cert.pdfUrl && (
                                  <a href={cert.pdfUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-cyan-600/10 text-cyan-500 hover:bg-cyan-600 hover:text-white transition-all" title="View PDF">
                                    <FileText className="h-4 w-4" />
                                  </a>
                                )}
                             </div>
                          </div>
                          <div className="flex-1 space-y-2">
                             <h5 className="font-bold text-white group-hover:text-cyan-400 transition-colors">{cert.name}</h5>
                             <p className="text-xs text-slate-400">{cert.provider}</p>
                             <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest mt-4">
                                Issued {new Date(cert.issueDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} 
                                {cert.expiryDate ? ` • Exp ${new Date(cert.expiryDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : ' • No Expiry'}
                             </p>
                             {cert.credentialId && (
                               <p className="text-[9px] font-mono text-slate-700 uppercase mt-1">ID: {cert.credentialId}</p>
                             )}
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                )}

                {/* Security & Compliance Certifications */}
                {certificates.filter(c => c.name.includes('Security') || c.name.includes('Certified') || c.name.includes('Compliance')).length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-rose-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" /> Security & Compliance
                    </h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      {certificates.filter(c => c.name.includes('Security') || c.name.includes('Certified') || c.name.includes('Compliance')).map((cert) => (
                        <article key={cert.id} className="flex flex-col h-full rounded-2xl border border-slate-800 bg-slate-950 p-6 transition-all hover:border-rose-500/30 group">
                          <div className="flex items-start justify-between gap-4 mb-4">
                             <div className="h-12 w-12 rounded-xl border border-slate-800 bg-slate-900 flex items-center justify-center shrink-0">
                                {cert.issuer?.logoUrl ? (
                                  <Image src={cert.issuer.logoUrl} alt={cert.provider} fill className="object-cover" />
                                ) : (
                                  <CheckCircle className="h-6 w-6 text-rose-900" />
                                )}
                             </div>
                             <div className="flex flex-wrap gap-2">
                                {cert.verifyUrl && (
                                  <a href={cert.verifyUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-900 text-slate-500 hover:text-rose-400 border border-slate-800 transition-colors" title="Verify Online">
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                )}
                                {cert.pdfUrl && (
                                  <a href={cert.pdfUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-rose-600/10 text-rose-500 hover:bg-rose-600 hover:text-white transition-all" title="View PDF">
                                    <FileText className="h-4 w-4" />
                                  </a>
                                )}
                             </div>
                          </div>
                          <div className="flex-1 space-y-2">
                             <h5 className="font-bold text-white group-hover:text-rose-400 transition-colors">{cert.name}</h5>
                             <p className="text-xs text-slate-400">{cert.provider}</p>
                             <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest mt-4">
                                Issued {new Date(cert.issueDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} 
                                {cert.expiryDate ? ` • Exp ${new Date(cert.expiryDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : ' • No Expiry'}
                             </p>
                             {cert.credentialId && (
                               <p className="text-[9px] font-mono text-slate-700 uppercase mt-1">ID: {cert.credentialId}</p>
                             )}
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                )}

                {/* Other Credentials */}
                {certificates.filter(c => !c.name.includes('Cloud') && !c.name.includes('Associate') && !c.name.includes('Professional') && !c.name.includes('Security') && !c.name.includes('Certified') && !c.name.includes('Compliance')).length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <Award className="h-4 w-4" /> Specializations & Training
                    </h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      {certificates.filter(c => !c.name.includes('Cloud') && !c.name.includes('Associate') && !c.name.includes('Professional') && !c.name.includes('Security') && !c.name.includes('Certified') && !c.name.includes('Compliance')).map((cert) => (
                        <article key={cert.id} className="flex flex-col h-full rounded-2xl border border-slate-800 bg-slate-950 p-6 transition-all hover:border-emerald-500/30 group">
                          <div className="flex items-start justify-between gap-4 mb-4">
                             <div className="h-12 w-12 rounded-xl border border-slate-800 bg-slate-900 flex items-center justify-center shrink-0">
                                {cert.issuer?.logoUrl ? (
                                  <Image src={cert.issuer.logoUrl} alt={cert.provider} fill className="object-cover" />
                                ) : (
                                  <CheckCircle className="h-6 w-6 text-emerald-900" />
                                )}
                             </div>
                             <div className="flex flex-wrap gap-2">
                                {cert.verifyUrl && (
                                  <a href={cert.verifyUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-900 text-slate-500 hover:text-emerald-400 border border-slate-800 transition-colors" title="Verify Online">
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                )}
                                {cert.pdfUrl && (
                                  <a href={cert.pdfUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600 hover:text-white transition-all" title="View PDF">
                                    <FileText className="h-4 w-4" />
                                  </a>
                                )}
                             </div>
                          </div>
                          <div className="flex-1 space-y-2">
                             <h5 className="font-bold text-white group-hover:text-emerald-400 transition-colors">{cert.name}</h5>
                             <p className="text-xs text-slate-400">{cert.provider}</p>
                             <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest mt-4">
                                Issued {new Date(cert.issueDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} 
                                {cert.expiryDate ? ` • Exp ${new Date(cert.expiryDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : ' • No Expiry'}
                             </p>
                             {cert.credentialId && (
                               <p className="text-[9px] font-mono text-slate-700 uppercase mt-1">ID: {cert.credentialId}</p>
                             )}
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Google Cloud Badges Section */}
            <div className="mt-16 p-8 rounded-3xl border border-slate-800 bg-slate-900/20 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-3">
                    <Cloud className="h-5 w-5 text-emerald-400" />
                    <h4 className="font-bold text-white uppercase tracking-widest text-sm">Cloud_Skills_Matrix</h4>
                  </div>
                  <a href="https://www.skills.google/public_profiles/ea12c24b-9b3d-43a0-b983-96cd33bd7b40" target="_blank" rel="noopener noreferrer" className="text-[9px] font-mono text-emerald-500 hover:text-emerald-400 transition-colors uppercase tracking-widest flex items-center gap-2">
                    LIVE_NODE_PROFILE <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <BadgeShowcase />
            </div>
          </section>

          {/* Achievements Section */}
          {achievements.length > 0 && (
            <section aria-labelledby="achievements-title">
              <div className="flex items-center gap-4 mb-12">
                 <div className="h-10 w-10 rounded-xl bg-amber-600/10 flex items-center justify-center border border-amber-500/20">
                    <Trophy className="h-5 w-5 text-amber-500" />
                 </div>
                 <h2 id="achievements-title" className="text-2xl font-bold text-white uppercase tracking-tighter">Achievements</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {achievements.map((achievement) => (
                  <article key={achievement.id} className="flex items-start gap-4 rounded-2xl border border-slate-800 bg-slate-950 p-6 transition-all hover:border-amber-500/30">
                    <div className="h-10 w-10 rounded-xl border border-amber-500/20 bg-amber-600/10 flex items-center justify-center shrink-0">
                      <Trophy className="h-5 w-5 text-amber-500" />
                    </div>
                    <div className="space-y-1">
                      <h5 className="font-bold text-white">{achievement.title}</h5>
                      {achievement.issuer && (
                        <p className="text-xs text-slate-400">{achievement.issuer}</p>
                      )}
                      {achievement.description && (
                        <p className="text-xs text-slate-500 mt-2">{achievement.description}</p>
                      )}
                      {achievement.achievedDate && (
                        <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest mt-2">{achievement.achievedDate}</p>
                      )}
                      {achievement.url && (
                        <a href={achievement.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-500 hover:text-amber-400 uppercase tracking-widest mt-2">
                          View <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar: Skills Matrix */}
        <aside className="space-y-8">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-8 backdrop-blur-md sticky top-24">
            <div className="flex items-center gap-2 mb-8">
               <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
               <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Neural_Skills_Matrix</h3>
            </div>
            
            <div className="space-y-8">
              {skillMatrix.map(skill => (
                <div key={skill.name} className="space-y-3">
                  <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest">
                    <span className="text-slate-400">{skill.name}</span>
                    <span className="text-cyan-500">{skill.level}%</span>
                  </div>
                  <div className="h-1 w-full rounded-full bg-slate-800/50 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-cyan-500 shadow-[0_0_15px_rgba(8,145,178,0.5)] transition-all duration-1000" 
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-slate-600 font-mono leading-relaxed">{skill.tools}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-slate-800/50">
               <p className="text-[10px] text-slate-500 leading-relaxed italic">
                 &quot;This matrix represents active deployment nodes and theoretical proficiencies across the tech stack.&quot;
               </p>
            </div>
          </div>
        </aside>
      </div>

      {/* Testimonials Section */}
      <div className="mt-24 pt-20 border-t border-slate-800/30">
        <TestimonialSection 
          testimonials={testimonials}
          title="Professional Recognition"
          subtitle="Verified feedback from collaborators, technical partners, and industry professionals"
        />
      </div>
    </div>
  );
}
