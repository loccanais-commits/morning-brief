"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Today", icon: "🏠" },
    { href: "/archive", label: "Archive", icon: "📅" },
    { href: "/favorites", label: "Favorites", icon: "⭐" },
    { href: "/about", label: "About", icon: "ℹ️" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-[var(--border-subtle)]">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <img 
              src="/icons/logo.png" 
              alt="Morning Brief" 
              className="w-10 h-10 rounded-xl"
            />
            <div className="hidden sm:block">
              <h1 className="font-bold text-white">Morning Brief</h1>
              <p className="text-xs text-[var(--text-muted)]">Daily Geopolitics</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-[var(--accent-primary)] text-black"
                    : "text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-elevated)]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Subscribe Button */}
          <Link
            href="/subscribe"
            className="px-4 py-2 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-black font-bold rounded-lg hover:opacity-90 transition-opacity text-sm"
          >
            Subscribe Free
          </Link>
        </div>
      </div>
    </header>
  );
}
