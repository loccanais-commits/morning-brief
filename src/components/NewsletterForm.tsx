"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) return;
    
    setStatus("loading");
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In production, POST to your newsletter API
    // const response = await fetch('/api/newsletter', {
    //   method: 'POST',
    //   body: JSON.stringify({ email }),
    // });
    
    setStatus("success");
    setEmail("");
  };

  if (status === "success") {
    return (
      <div className="card p-8 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-full bg-[var(--accent-success)]/20 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[var(--accent-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
          You&apos;re subscribed!
        </h3>
        <p className="text-[var(--text-secondary)]">
          Check your inbox tomorrow at 6 AM EST for your first briefing.
        </p>
      </div>
    );
  }

  return (
    <div className="card p-8 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-full bg-[var(--accent-primary)]/20 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
          Get the Daily Briefing
        </h3>
        <p className="text-[var(--text-secondary)] text-sm">
          Start every morning with the top geopolitics stories. Delivered at 6 AM EST.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="flex-1 px-4 py-3 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
        />
        <button 
          type="submit"
          disabled={status === "loading"}
          className="btn btn-primary whitespace-nowrap disabled:opacity-50"
        >
          {status === "loading" ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Subscribing...
            </>
          ) : (
            "Subscribe Free"
          )}
        </button>
      </form>
      
      <p className="text-xs text-[var(--text-muted)] text-center mt-4">
        No spam. Unsubscribe anytime.
      </p>
    </div>
  );
}
