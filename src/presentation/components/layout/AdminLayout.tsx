"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/presentation/components/auth/logoutButton";
import { Menu, X } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Sidebar navigation links
  const navLinks = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/blogs", label: "Blogs" },
    { href: "/admin/case-studies", label: "Case Studies" },
    { href: "/admin/projects", label: "Projects" },
    { href: "/admin/research", label: "Research" },
  ];

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-gray-900 text-white flex flex-col transform 
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        transition-transform duration-300 ease-in-out z-40`}
      >
        <div className="p-4 font-bold text-lg border-b border-gray-700 flex items-center justify-between">
          <span>Admin Panel</span>
          {/* Close button on mobile */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsOpen(false)}
            aria-label="Close Sidebar"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href || (pathname?.startsWith(link.href + "/") ?? false);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block p-2 rounded transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white font-medium"
                    : "hover:bg-gray-800 text-gray-300"
                }`}
                onClick={() => setIsOpen(false)} // close sidebar when clicking on mobile
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <LogoutButton />
        </div>
      </aside>

      {/* Overlay for mobile when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="p-4 bg-white shadow flex items-center justify-between">
          <h1 className="font-semibold text-gray-800">Admin</h1>
          {/* Toggle button (hamburger) visible only on mobile */}
          <button
            className="md:hidden text-gray-800"
            onClick={() => setIsOpen(true)}
            aria-label="Open Sidebar"
          >
            <Menu size={24} />
          </button>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
