import { Github, Linkedin, Twitter, Instagram, Mail, MapPin, Terminal, Rss, ArrowUp, Clock } from "lucide-react";
import Link from "next/link";
import { SITE } from "@/config/site";

/**
 * Site-wide footer. A server component: no client JavaScript, renders as plain
 * HTML in the cached page, so it costs nothing to load or run.
 * Columns answer the three things visitors come for: see the work, work with me, get in touch.
 */

type FooterLink = { name: string; href: string; hint?: string };

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Explore",
    links: [
      { name: "Projects & ventures", href: "/projects" },
      { name: "Research", href: "/research" },
      { name: "Blog", href: "/blog" },
      { name: "Resume", href: "/resume" },
    ],
  },
  {
    title: "Work with me",
    links: [
      { name: "Hire me", href: "/contact?topic=Hiring" },
      { name: "Freelance project", href: "/contact?topic=Freelance%20project" },
      { name: "Partner or invest", href: "/contact?topic=Partnership%20or%20investment" },
      { name: "Research collaboration", href: "/contact?topic=Research%20collaboration" },
    ],
  },
];

const SOCIAL = [
  { label: "LinkedIn", href: SITE.social.linkedin, Icon: Linkedin },
  { label: "GitHub", href: SITE.social.github, Icon: Github },
  { label: "X (Twitter)", href: SITE.social.x, Icon: Twitter },
  { label: "Instagram", href: SITE.social.instagram, Icon: Instagram },
];

const link =
  "rounded text-sm text-slate-400 transition-colors hover:text-cyan-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-800 bg-[#010409] pb-8 pt-14" aria-labelledby="footer-title">
      <div className="container mx-auto px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Who and how to reach */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <h2 id="footer-title" className="text-lg font-bold text-white">{SITE.name}</h2>
            <p className="max-w-sm text-sm leading-relaxed text-slate-400">{SITE.positioning}</p>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                {SITE.location}
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                {SITE.responseTime}
              </li>
            </ul>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="mb-4 text-sm font-semibold text-white">{col.title}</h2>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className={link}>{l.name}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/* Contact, social and extras */}
          <div>
            <h2 className="mb-4 text-sm font-semibold text-white">Get in touch</h2>
            <ul className="space-y-3">
              <li>
                <a href={`mailto:${SITE.email}`} className={`${link} inline-flex items-center gap-2 break-all`}>
                  <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {SITE.email}
                </a>
              </li>
              <li>
                <Link href="/contact" className={link}>Contact form</Link>
              </li>
              <li>
                <Link href="/terminal" className={`${link} inline-flex items-center gap-2 font-mono`}>
                  <Terminal className="h-4 w-4 shrink-0" aria-hidden="true" />
                  Terminal mode
                </Link>
              </li>
              <li>
                <a href="/feed.xml" className={`${link} inline-flex items-center gap-2`}>
                  <Rss className="h-4 w-4 shrink-0" aria-hidden="true" />
                  RSS feed
                </a>
              </li>
            </ul>
            <ul className="mt-5 flex gap-2" aria-label="Social profiles">
              {SOCIAL.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${label} (opens in a new tab)`}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-slate-400 transition hover:bg-slate-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-slate-800/50 pt-6 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>© {year} {SITE.name}. Messages sent through the contact form are used only to reply to you.</p>
          <a href="#" className="inline-flex items-center gap-1.5 self-start rounded hover:text-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 md:self-auto">
            <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
            Back to top
          </a>
        </div>
      </div>
    </footer>
  );
}
