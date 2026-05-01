import type { Metadata } from "next";
import "@/presentation/styles/globals.css";
import { cn } from "@/infrastructure/security/headers";
import Header from "@/presentation/components/layout/Header";
import Footer from "@/presentation/components/layout/Footer";
import ClientWrapper from "@/presentation/components/layout/ClientWrapper";

export const metadata: Metadata = {
  title: "Aime Serge Ukobizaba | Software Engineer, Cybersecurity Analyst, Aspiring AI Engineer & Cloud Architect Certisfied  ALX Ventures Rwanda Ambassador",
  description: "Advanced Full-Stack Portfolio focused on Cybersecurity, Cloud Infrastructure, and AI-Powered Solutions.",
  metadataBase: new URL('https://aimesergeonline.vercel.app'),
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-slate-950 antialiased selection:bg-cyan-500/30"
        )}
      >
        <div className="relative flex min-h-screen flex-col">
          {/* Background Grid Decoration */}
          <div className="fixed inset-0 -z-10 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
          
          <Header />
          <main className="flex-1">
            <ClientWrapper>
              {children}
            </ClientWrapper>
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
