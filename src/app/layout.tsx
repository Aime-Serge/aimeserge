import type { Metadata, Viewport } from "next";
import "@/presentation/styles/globals.css";
import { cn } from "@/infrastructure/security/headers";
import Header from "@/presentation/components/layout/Header";
import Footer from "@/presentation/components/layout/Footer";
import ClientWrapper from "@/presentation/components/layout/ClientWrapper";
import ScrollToTop from "@/presentation/components/shared/ScrollToTop";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SITE, jsonLd } from "@/config/site";
import { getSiteSettings } from "@/core/domain/portfolio/queries";

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  // No maximumScale: people must be able to pinch-zoom (WCAG 1.4.4).
};

/** Only the real production site may be indexed; Vercel preview copies must not compete with it. */
const INDEXABLE = (process.env.VERCEL_ENV ?? "production") === "production";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const description = settings.identity.description;
  const title = `${SITE.name} | ${SITE.headline}`;
  return {
    title: { default: title, template: `%s | ${SITE.shortName}` },
    description,
    applicationName: SITE.name,
    authors: [{ name: SITE.name, url: SITE.url }],
    creator: SITE.name,
    metadataBase: new URL(SITE.url),
    alternates: {
      canonical: "/",
      types: { "application/rss+xml": [{ url: "/feed.xml", title: `${SITE.name}: Blog` }] },
    },
    robots: INDEXABLE
      ? { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } }
      : { index: false, follow: false },
    verification: settings.seo.googleVerification ? { google: settings.seo.googleVerification } : undefined,
    manifest: "/manifest.json",
    icons: {
      icon: [{ url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" }],
      apple: "/icons/apple-touch-icon.png",
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: SITE.url,
      siteName: SITE.name,
      title,
      description,
      images: [{ url: "/icons/og.jpg", width: 1200, height: 630, alt: `${SITE.name}, ${SITE.headline}` }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/icons/og.jpg"] },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body
        className={cn(
          "min-h-screen bg-slate-950 font-sans antialiased selection:bg-cyan-500/30 text-slate-200"
        )}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: SITE.name,
              url: SITE.url,
              inLanguage: "en",
              publisher: { "@type": "Person", name: SITE.name, url: SITE.url },
            }),
          }}
        />
        <a 
          href="#main-content" 
          className="absolute left-0 top-0 z-50 -translate-y-full bg-cyan-600 px-4 py-2 text-sm font-bold text-white transition-transform focus:translate-y-0"
        >
          Skip to main content
        </a>
        <div className="relative flex min-h-screen flex-col">
          {/* Background Decoration */}
          <div className="fixed inset-0 -z-10 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
          
          <Header />
          <main id="main-content" className="flex-1">
            <ClientWrapper>
              {children}
            </ClientWrapper>
          </main>
          <Footer />
          
          <ScrollToTop />
          <Analytics />
          <SpeedInsights />
        </div>
      </body>
    </html>
  );
}
