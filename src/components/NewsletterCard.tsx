"use client";

import { useState } from "react";

export default function NewsletterCard() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email");
      return;
    }

    setStatus("loading");

    try {
      // Chamar API real
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStatus("success");
        setMessage("Welcome aboard! Check your inbox.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
    
    // Reset após 3 segundos
    setTimeout(() => {
      setStatus("idle");
      setMessage("");
    }, 3000);
  };

  return (
    <div className="newsletter-card w-full max-w-md mx-auto">
      <div className="p-8 bg-[#161616] rounded-2xl border border-[rgba(43,153,98,0.3)] shadow-[0px_15px_60px_rgba(0,255,127,0.15)]">
        {/* Header */}
        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold text-[#00FF7F]">Stay Informed</h3>
          <p className="text-white mt-3">
            Get the daily briefing delivered to your inbox every morning.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={status === "loading" || status === "success"}
              className="w-full px-5 py-4 bg-transparent border border-[#404040] rounded-lg text-[#00FF7F] placeholder-[#666] focus:outline-none focus:border-[#00FF7F] transition-colors disabled:opacity-50"
            />
            {/* Email icon */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="20" height="16" x="2" y="4" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={status === "loading" || status === "success"}
            className="w-full py-4 px-6 font-semibold text-sm border border-[#00FF7F] rounded-lg text-[#00FF7F] bg-transparent hover:bg-[#00FF7F] hover:text-[#161616] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "loading" ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Subscribing...
              </span>
            ) : status === "success" ? (
              <span className="flex items-center justify-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Subscribed!
              </span>
            ) : (
              "Subscribe for Free"
            )}
          </button>

          {/* Message */}
          {message && (
            <p className={`text-center text-sm ${status === "error" ? "text-red-400" : "text-[#00FF7F]"}`}>
              {message}
            </p>
          )}
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-[#666] mt-6">
          No spam, ever. Unsubscribe anytime.
        </p>

        {/* Decorative bar */}
        <div className="flex justify-center mt-6 gap-2">
          <div className="w-8 h-2 rounded-full bg-[#00FF7F]" />
          <div className="w-2 h-2 rounded-full bg-[#666]" />
          <div className="w-2 h-2 rounded-full bg-[#666]" />
        </div>
      </div>
    </div>
  );
}

// Compact version for sidebar/footer
export function NewsletterCompact() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  if (subscribed) {
    return (
      <div className="p-4 bg-[#161616] rounded-xl border border-[rgba(0,255,127,0.3)] text-center">
        <p className="text-[#00FF7F] font-medium">✓ You're subscribed!</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="flex-1 px-4 py-2 bg-transparent border border-[#404040] rounded-lg text-[#00FF7F] placeholder-[#666] focus:outline-none focus:border-[#00FF7F] text-sm"
      />
      <button
        type="submit"
        className="px-4 py-2 border border-[#00FF7F] rounded-lg text-[#00FF7F] hover:bg-[#00FF7F] hover:text-[#161616] transition-colors text-sm font-medium"
      >
        Join
      </button>
    </form>
  );
}
