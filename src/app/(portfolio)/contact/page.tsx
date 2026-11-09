import type { Metadata } from "next";
import { Mail, Clock, MapPin } from "lucide-react";
import ContactForm from "@/presentation/components/features/ContactForm";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${SITE.name} about a job, a freelance project or a collaboration.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-6 py-16 lg:py-24">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Let&apos;s talk</h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
              Hiring, a freelance project, or an idea you want to build together? Send me a short note and
              I&apos;ll get back to you.
            </p>
          </div>

          <ul className="grid gap-4">
            <li className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
              <Mail className="h-5 w-5 shrink-0 text-cyan-500" aria-hidden="true" />
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <a href={`mailto:${SITE.email}`} className="font-semibold text-white hover:text-cyan-400 break-all">
                  {SITE.email}
                </a>
              </div>
            </li>
            <li className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
              <Clock className="h-5 w-5 shrink-0 text-emerald-500" aria-hidden="true" />
              <div>
                <p className="text-xs text-slate-500">Response time</p>
                <p className="font-medium text-slate-300">{SITE.responseTime}</p>
              </div>
            </li>
            <li className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
              <MapPin className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
              <div>
                <p className="text-xs text-slate-500">Based in</p>
                <p className="font-medium text-slate-300">{SITE.location} · open to remote work</p>
              </div>
            </li>
          </ul>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
