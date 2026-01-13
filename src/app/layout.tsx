import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PlayerProvider } from "@/contexts/PlayerContext";
import Header from "@/components/Header";
import PlayerBar from "@/components/PlayerBar";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

export const metadata: Metadata = {
  title: "Morning Brief - Daily Geopolitics Audio Briefing",
  description: "Get your daily geopolitics news in 2 minutes. Short audio briefings for busy people who want to stay informed about what's happening in the world.",
  keywords: "geopolitics, news briefing, audio news, daily briefing, world news, china, russia, middle east",
  authors: [{ name: "Morning Brief" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Morning Brief",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Morning Brief",
    title: "Morning Brief - Daily Geopolitics Audio Briefing",
    description: "Get your daily geopolitics news in 2 minutes.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen flex flex-col">
        <PlayerProvider>
          <ServiceWorkerRegistration />
          
          {/* Header */}
          <Header />

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer */}
          <Footer />

          {/* Global Audio Player Bar */}
          <PlayerBar />
        </PlayerProvider>
      </body>
    </html>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="bg-[var(--bg-secondary)] border-t border-[var(--border-subtle)]">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-black">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" fill="currentColor"/>
                </svg>
              </div>
              <span className="text-lg font-semibold text-[var(--text-primary)]">Morning Brief</span>
            </div>
            <p className="text-sm text-[var(--text-secondary)] max-w-sm">
              Your trusted source for daily geopolitics news. 
              No spin, no noise — just the facts you need to start your day informed.
            </p>
          </div>
          
          {/* Links */}
          <div>
            <h4 className="text-sm font-medium text-[var(--text-primary)] mb-4">Navigation</h4>
            <ul className="space-y-2">
              <li><a href="/" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Today&apos;s Briefing</a></li>
              <li><a href="/archive" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Archive</a></li>
              <li><a href="/favorites" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Favorites</a></li>
              <li><a href="/about" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">About</a></li>
            </ul>
          </div>
          
          {/* Social */}
          <div>
            <h4 className="text-sm font-medium text-[var(--text-primary)] mb-4">Connect</h4>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-all" aria-label="Twitter/X">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-all" aria-label="YouTube">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-[var(--border-subtle)] mt-8 pt-8 text-center text-sm text-[var(--text-muted)]">
          <p>© {new Date().getFullYear()} Morning Brief. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
