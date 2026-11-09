import { Github, Linkedin, Twitter, Instagram, Mail, MapPin } from "lucide-react";
import Link from "next/link";
import { SITE } from "@/config/site";

const NAV = [
  { name: "Projects", href: "/projects" },
  { name: "Research", href: "/research" },
  { name: "Blog", href: "/blog" },
  { name: "Resume", href: "/resume" },
  { name: "Contact", href: "/contact" },
];

const SOCIAL = [
  { label: "GitHub", href: SITE.social.github, Icon: Github },
  { label: "LinkedIn", href: SITE.social.linkedin, Icon: Linkedin },
  { label: "X (Twitter)", href: SITE.social.x, Icon: Twitter },
  { label: "Instagram", href: SITE.social.instagram, Icon: Instagram },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-800 bg-[#010409] pb-8 pt-14">
      <div className="container mx-auto px-6">
        <div className="mb-10 grid gap-10 md:grid-cols-3">
          <div className="space-y-4">
            <p className="text-lg font-bold text-white">{SITE.name}</p>
            <p className="text-sm leading-relaxed text-slate-400">{SITE.description}</p>
            <ul className="flex gap-3">
              {SOCIAL.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${label} (opens in a new tab)`}
                    className="block rounded-full bg-slate-900 p-2.5 text-slate-400 transition hover:bg-slate-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav aria-label="Footer">
            <h2 className="mb-4 text-sm font-semibold text-white">Explore</h2>
            <ul className="space-y-3">
              {NAV.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-slate-400 transition-colors hover:text-cyan-400">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="mb-4 text-sm font-semibold text-white">Contact</h2>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 shrink-0 text-slate-500" aria-hidden="true" />
                <a href={`mailto:${SITE.email}`} className="break-all transition-colors hover:text-white">
                  {SITE.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 shrink-0 text-slate-500" aria-hidden="true" />
                <span>{SITE.location}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-800/50 pt-6 text-xs text-slate-500 md:flex-row">
          <p>© {year} {SITE.name}. Built with Next.js and hosted on Vercel.</p>
          <p>
            Messages you send through the contact form are used only to reply to you.
          </p>
        </div>
      </div>
    </footer>
  );
}
