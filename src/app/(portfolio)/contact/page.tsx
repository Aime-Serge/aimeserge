import { getSiteSettings } from "@/core/domain/portfolio/queries";
import { Mail, Clock, MapPin } from "lucide-react";
import ContactForm from "@/presentation/components/features/ContactForm";

export async function generateMetadata() {
  const page = (await getSiteSettings()).pages.contact;
  return {
    title: "Contact",
    description: page.seoDescription,
    alternates: { canonical: "/contact" },
    openGraph: { title: page.title, description: page.seoDescription, url: "/contact" },
  };
}

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  const settings = await getSiteSettings();
  const page = settings.pages.contact;
  const { topic } = await searchParams;
  return (
    <div className="container mx-auto px-6 py-16 lg:py-24">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">{page.title}</h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
              {page.intro}
            </p>
          </div>

          <ul className="grid gap-4">
            <li className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
              <Mail className="h-5 w-5 shrink-0 text-cyan-500" aria-hidden="true" />
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <a href={`mailto:${settings.contact.email}`} className="font-semibold text-white hover:text-cyan-400 break-all">
                  {settings.contact.email}
                </a>
              </div>
            </li>
            <li className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
              <Clock className="h-5 w-5 shrink-0 text-emerald-500" aria-hidden="true" />
              <div>
                <p className="text-xs text-slate-500">Response time</p>
                <p className="font-medium text-slate-300">{settings.contact.responseTime}</p>
              </div>
            </li>
            <li className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
              <MapPin className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
              <div>
                <p className="text-xs text-slate-500">Based in</p>
                <p className="font-medium text-slate-300">{settings.contact.location} · open to remote work</p>
              </div>
            </li>
          </ul>
        </div>

        <ContactForm initialInterest={topic} />
      </div>
    </div>
  );
}
