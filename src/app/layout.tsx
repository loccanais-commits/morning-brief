import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Morning Brief - Daily Geopolitics",
  description: "Your daily 5-minute audio briefing on global news. Stay informed about China, Russia, Middle East, Economy, Defense, and Technology.",
  keywords: "news, geopolitics, daily briefing, audio news, world news, China, Russia, Middle East",
  authors: [{ name: "Morning Brief" }],
  openGraph: {
    title: "Morning Brief - Daily Geopolitics",
    description: "Your daily 5-minute audio briefing on global news",
    url: "https://morningbrief.news",
    siteName: "Morning Brief",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Morning Brief - Daily Geopolitics",
    description: "Your daily 5-minute audio briefing on global news",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7255726305591716"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        
        {/* Favicon */}
        <link rel="icon" href="/icons/logo.png" />
        <link rel="apple-touch-icon" href="/icons/logo.png" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
