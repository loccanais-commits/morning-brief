import NewsletterCard from "@/components/NewsletterCard";

export const metadata = {
  title: "About | Morning Brief",
  description: "Your daily geopolitics briefing, made by news enthusiasts for news enthusiasts.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-in">
          <span className="section-label mb-6 inline-flex">About Us</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-4 mb-6">
            News Without the <span className="text-gradient">Noise</span>
          </h1>
          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
            We cut through the chaos so you don't have to.
          </p>
        </div>

        {/* Main Content */}
        <article className="prose prose-invert max-w-none space-y-8">
          {/* Why We Exist */}
          <section className="card p-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="text-2xl">🎯</span>
              Why We Exist
            </h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Let's be honest: staying informed about world events is exhausting. Between 24-hour news cycles, 
              clickbait headlines, and endless hot takes, finding reliable geopolitical news feels like drinking 
              from a firehose.
            </p>
            <p className="text-[var(--text-secondary)] leading-relaxed mt-4">
              We created Morning Brief because we were tired of spending hours scrolling through news sites. 
              We wanted something simple: wake up, get the facts, move on with our day. No sensationalism. 
              No bias. Just the stories that actually matter.
            </p>
          </section>

          {/* What We Do */}
          <section className="card p-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="text-2xl">📻</span>
              What We Do
            </h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Every morning, we scan dozens of sources—Reuters, BBC, AP, and more—to bring you the 
              most important geopolitical stories. Our AI-powered system summarizes the news, and we 
              deliver it in a quick 2-minute audio briefing you can listen to during your morning coffee.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="p-4 bg-[var(--bg-elevated)] rounded-xl text-center">
                <p className="text-3xl font-bold text-[var(--accent-primary)]">2</p>
                <p className="text-sm text-[var(--text-muted)]">Minutes to listen</p>
              </div>
              <div className="p-4 bg-[var(--bg-elevated)] rounded-xl text-center">
                <p className="text-3xl font-bold text-[var(--accent-primary)]">10</p>
                <p className="text-sm text-[var(--text-muted)]">Stories per day</p>
              </div>
              <div className="p-4 bg-[var(--bg-elevated)] rounded-xl text-center">
                <p className="text-3xl font-bold text-[var(--accent-primary)]">6AM</p>
                <p className="text-sm text-[var(--text-muted)]">Fresh every morning</p>
              </div>
            </div>
          </section>

          {/* Our Focus */}
          <section className="card p-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="text-2xl">🌍</span>
              What We Cover
            </h2>
            <p className="text-[var(--text-secondary)] leading-relaxed mb-6">
              We focus on geopolitical news that shapes our world: great power competition, 
              international relations, defense, energy, and global economics.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="pill pill-china">China</span>
              <span className="pill pill-russia">Russia</span>
              <span className="pill pill-middleeast">Middle East</span>
              <span className="pill pill-europe">Europe</span>
              <span className="pill pill-economy">Economy</span>
              <span className="pill pill-defense">Defense</span>
              <span className="pill pill-energy">Energy</span>
              <span className="pill pill-world">World</span>
            </div>
          </section>

          {/* For the Community */}
          <section className="card p-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="text-2xl">👥</span>
              By Users, For Users
            </h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Morning Brief is built by news enthusiasts for news enthusiasts. We're not a media company. 
              We're not trying to sell you anything. We're just people who care about staying informed 
              and want to make it easier for everyone else too.
            </p>
            <p className="text-[var(--text-secondary)] leading-relaxed mt-4">
              This project is open to feedback and suggestions. If you have ideas on how to make Morning Brief 
              better, we're all ears.
            </p>
          </section>

          {/* Tech Stack */}
          <section className="card p-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              Built With
            </h2>
            <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
              For the curious, here's what powers Morning Brief:
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-[var(--bg-elevated)] rounded-full text-sm text-[var(--text-secondary)]">
                Next.js
              </span>
              <span className="px-3 py-1 bg-[var(--bg-elevated)] rounded-full text-sm text-[var(--text-secondary)]">
                Claude AI
              </span>
              <span className="px-3 py-1 bg-[var(--bg-elevated)] rounded-full text-sm text-[var(--text-secondary)]">
                ElevenLabs
              </span>
              <span className="px-3 py-1 bg-[var(--bg-elevated)] rounded-full text-sm text-[var(--text-secondary)]">
                Supabase
              </span>
              <span className="px-3 py-1 bg-[var(--bg-elevated)] rounded-full text-sm text-[var(--text-secondary)]">
                Vercel
              </span>
            </div>
          </section>
        </article>

        {/* Newsletter CTA */}
        <div className="mt-16">
          <NewsletterCard />
        </div>

        {/* Social / YouTube */}
        <div className="mt-16 text-center">
          <p className="text-[var(--text-muted)] mb-4">Follow us for more content</p>
          <a 
            href="https://www.youtube.com/@VictoriaStoneGlobal" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            Subscribe on YouTube
          </a>
        </div>

        {/* Contact */}
        <div className="mt-16 text-center">
          <p className="text-[var(--text-muted)]">
            Questions? Feedback? Reach out at{" "}
            <a href="mailto:hello@morningbrief.news" className="text-[var(--accent-primary)] hover:underline">
              hello@morningbrief.news
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
