import { Github, Linkedin, Twitter, Instagram, ShieldCheck, Mail, MapPin, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const navLinks = [
    { name: "Projects", href: "/projects" },
    { name: "Research", href: "/research" },
    { name: "Blog", href: "/blog" },
    { name: "Resume", href: "/resume" },
    { name: "Terminal", href: "/terminal" },
  ];

  const legalLinks = [
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
    { name: "Security Statement", href: "#" },
  ];

  return (
    <footer className="relative border-t border-slate-800 bg-[#010409] pt-16 pb-8 overflow-hidden">
      {/* Subtle Atmospheric Glow */}
      <div className="absolute -bottom-24 -right-24 -z-10 h-96 w-96 rounded-full bg-cyan-500/5 blur-[120px]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4 mb-12">
          {/* Column 1: Brand & Identity */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-white font-bold font-mono">
              <ShieldCheck className="h-6 w-6 text-cyan-500" />
              <span className="text-lg tracking-tight">AIME SERGE UKOBIZABA</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Senior Software Engineer specializing in Cyber-Cloud architectures and AI-powered solutions. 
              Engineering secure, scalable, and inclusive digital ecosystems.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://github.com/aime-serge" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="GitHub Profile"
                className="rounded-full bg-slate-900 p-2.5 text-slate-400 transition hover:bg-slate-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
              >
                <Github className="h-5 w-5" />
              </a>
              <a 
                href="https://www.linkedin.com/in/aimesergeukobizaba/" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="LinkedIn Profile"
                className="rounded-full bg-slate-900 p-2.5 text-slate-400 transition hover:bg-slate-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a 
                href="https://x.com/aime__serge" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Twitter Profile"
                className="rounded-full bg-slate-900 p-2.5 text-slate-400 transition hover:bg-slate-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="https://www.instagram.com/_aime_serge/" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Instagram Profile"
                className="rounded-full bg-slate-900 p-2.5 text-slate-400 transition hover:bg-slate-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Column 2: System Navigation */}
          <div>
            <h3 className="text-white font-bold font-mono text-sm uppercase tracking-widest mb-6 border-l-2 border-cyan-500 pl-3">
              System_Nav
            </h3>
            <ul className="space-y-4">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-slate-400 hover:text-cyan-400 transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="h-px w-2 bg-slate-700 group-hover:bg-cyan-500 transition-all"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Node */}
          <div>
            <h3 className="text-white font-bold font-mono text-sm uppercase tracking-widest mb-6 border-l-2 border-emerald-500 pl-3">
              Contact_Node
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-slate-400">
                <Mail className="h-5 w-5 text-slate-500 shrink-0" />
                <a href="mailto:aimeserge51260@gmail.com" className="hover:text-white transition-colors">
                  aimeserge51260@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-400">
                <MapPin className="h-5 w-5 text-slate-500 shrink-0" />
                <span>Kigali, Rwanda <br/> <span className="text-[10px] text-slate-600 uppercase tracking-tighter">Lat: -1.9441 | Long: 30.0619</span></span>
              </li>
            </ul>
          </div>

          {/* Column 4: Compliance & Legal */}
          <div>
            <h3 className="text-white font-bold font-mono text-sm uppercase tracking-widest mb-6 border-l-2 border-slate-500 pl-3">
              Governance
            </h3>
            <ul className="space-y-4">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-slate-400 hover:text-white transition-colors text-sm flex items-center justify-between group"
                  >
                    {link.name}
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left space-y-2">
            <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">
              © {currentYear} Engineered with Next.js 15 & Zero-Trust principles.
            </p>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-mono text-slate-700 uppercase tracking-[0.2em]" aria-label="System verification status">
                SECURE_NODE_INTEGRITY_VERIFIED
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-slate-900/50 border border-slate-800">
            <ShieldCheck className="h-4 w-4 text-cyan-500" />
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
              Verified by Gemini AI
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
