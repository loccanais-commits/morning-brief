"use client";

import { useState } from "react";
import { AnimatedGridBackground } from "@/components/ui/background-effects";

export default function SubscribePage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("success");
        setMessage("🎉 Welcome aboard! Check your inbox for confirmation.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <AnimatedGridBackground />
      
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-16 text-center">
        {/* Logo */}
        <img 
          src="/icons/logo.png" 
          alt="Morning Brief" 
          className="w-24 h-24 rounded-2xl mx-auto mb-8"
        />

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
          Get Smarter About
          <span className="text-[var(--accent-primary)]"> World Events</span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl text-[var(--text-secondary)] mb-8 max-w-lg mx-auto">
          Join 10,000+ busy professionals who start their day with our 
          <strong className="text-white"> 5-minute audio briefing</strong> on global news.
        </p>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="card p-4">
            <div className="text-3xl mb-2">🎧</div>
            <h3 className="font-semibold text-white mb-1">Audio First</h3>
            <p className="text-sm text-[var(--text-muted)]">Listen while commuting or exercising</p>
          </div>
          <div className="card p-4">
            <div className="text-3xl mb-2">⏱️</div>
            <h3 className="font-semibold text-white mb-1">5 Minutes</h3>
            <p className="text-sm text-[var(--text-muted)]">Everything you need to know, fast</p>
          </div>
          <div className="card p-4">
            <div className="text-3xl mb-2">🌍</div>
            <h3 className="font-semibold text-white mb-1">6 Categories</h3>
            <p className="text-sm text-[var(--text-muted)]">China, Russia, Middle East & more</p>
          </div>
        </div>

        {/* Form */}
        {status === "success" ? (
          <div className="card p-8 bg-green-500/10 border-green-500/30">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-white mb-2">You're In!</h2>
            <p className="text-[var(--text-secondary)]">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-5 py-4 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] text-lg"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="px-8 py-4 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-black font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 text-lg whitespace-nowrap"
              >
                {status === "loading" ? "Joining..." : "Join Free →"}
              </button>
            </div>

            {status === "error" && (
              <p className="mt-3 text-red-400 text-sm">{message}</p>
            )}

            <p className="mt-4 text-sm text-[var(--text-muted)]">
              📬 Delivered daily at 6 AM EST. Unsubscribe anytime.
            </p>
          </form>
        )}

        {/* Social Proof */}
        <div className="mt-12 pt-8 border-t border-[var(--border-subtle)]">
          <p className="text-sm text-[var(--text-muted)] mb-4">TRUSTED BY READERS FROM</p>
          <div className="flex flex-wrap justify-center gap-6 text-[var(--text-muted)] opacity-60">
            <span className="text-lg font-semibold">Google</span>
            <span className="text-lg font-semibold">Microsoft</span>
            <span className="text-lg font-semibold">Amazon</span>
            <span className="text-lg font-semibold">Meta</span>
            <span className="text-lg font-semibold">Apple</span>
          </div>
        </div>

        {/* Sample Topics */}
        <div className="mt-12">
          <p className="text-sm text-[var(--text-muted)] mb-4">RECENT TOPICS WE COVERED</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              "🇨🇳 China Trade Policy",
              "🇷🇺 Russia Sanctions",
              "🇮🇱 Middle East Updates",
              "💰 Fed Rate Decisions",
              "🛡️ NATO Defense",
              "🤖 AI Regulations"
            ].map((topic) => (
              <span 
                key={topic}
                className="px-3 py-1 bg-[var(--bg-elevated)] rounded-full text-sm text-[var(--text-secondary)]"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
