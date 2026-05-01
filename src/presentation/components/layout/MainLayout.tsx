import React from "react";
import Header from "./Header";
import Footer from "./Footer";

type MainLayoutProps = {
  children: React.ReactNode;
  showHeader?: boolean; // optional, defaults to true
};

export default function MainLayout({ children, showHeader = true }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {showHeader && <Header />} {/* render only if showHeader is true */}
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
      <Footer />
    </div>
  );
}
