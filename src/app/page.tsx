"use client";

import { useState, useEffect } from "react";
import { usePlayer } from "@/contexts/PlayerContext";
import Loader from "@/components/Loader";
import NewsletterCard from "@/components/NewsletterCard";
import { ExpandableCard } from "@/components/ui/expandable-card";
import { AnimatedGridBackground } from "@/components/ui/background-effects";

// Tipos baseados no novo sistema
interface NewsStory {
  id: string;
  uuid: string;
  title: string;
  summary: string;
  category: string;
  categoryDisplay: string;
  source: string;
  sourceUrl: string;
  imageUrl?: string;
  publishedAt: string;
}

interface CategoryBrief {
  category: string;
  displayName: string;
  emoji: string;
  headline: string;
  script?: string;
  audioUrl?: string;
  storyCount: number;
  estimatedDuration: string;
  stories: NewsStory[];
}

interface DailyBriefing {
  date: string;
  generatedAt: string;
  fullBriefing: {
    headline: string;
    script: string;
    audioUrl?: string;
    duration: string;
    storyCount: number;
  };
  categoryBriefs: CategoryBrief[];
  stories: NewsStory[];
  meta: {
    totalStories: number;
    categoryCounts: Record<string, number>;
    topSources: string[];
  };
}

// Saudação baseada no horário
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 18) return "Good Afternoon";
  return "Good Night";
}

// Cores das categorias
function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    china: "#EF4444",
    russia: "#3B82F6",
    middleeast: "#F59E0B",
    economy: "#10B981",
    defense: "#6366F1",
    technology: "#8B5CF6",
  };
  return colors[category] || "#6B7280";
}

function getCategoryPillClass(category: string): string {
  const classes: Record<string, string> = {
    china: "bg-red-500/20 text-red-400",
    russia: "bg-blue-500/20 text-blue-400",
    middleeast: "bg-amber-500/20 text-amber-400",
    economy: "bg-green-500/20 text-green-400",
    defense: "bg-indigo-500/20 text-indigo-400",
    technology: "bg-purple-500/20 text-purple-400",
  };
  return classes[category] || "bg-gray-500/20 text-gray-400";
}

// Formatar data da notícia
function formatStoryDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HomePage() {
  const { play, isPlaying, currentTrack, toggle } = usePlayer();
  
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAllStories, setShowAllStories] = useState(false);
  const [readMode, setReadMode] = useState(false);

  // Carregar favoritos
  useEffect(() => {
    const stored = localStorage.getItem("morning-brief-favorites");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setFavorites(new Set(parsed.map((f: { id: string }) => f.id)));
      } catch (e) {
        console.error("Failed to parse favorites:", e);
      }
    }
  }, []);

  // Buscar briefing
  useEffect(() => {
    async function fetchBriefing() {
      try {
        const res = await fetch("/api/briefings");
        const data = await res.json();
        
        if (data.success && data.briefing) {
          setBriefing(data.briefing);
        }
      } catch (err) {
        console.error("Failed to fetch briefing:", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchBriefing();
  }, []);

  // Gerar briefing
  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    
    try {
      const res = await fetch("/api/briefings/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      const data = await res.json();
      
      if (data.success) {
        const briefingRes = await fetch("/api/briefings");
        const briefingData = await briefingRes.json();
        
        if (briefingData.success && briefingData.briefing) {
          setBriefing(briefingData.briefing);
        }
      } else {
        setError(data.error || "Failed to generate");
      }
    } catch (err) {
      setError("Network error");
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  // Play Full Briefing
  const handlePlayFull = () => {
    if (!briefing?.fullBriefing?.audioUrl) return;
    
    const isCurrentFull = currentTrack?.id === `full-${briefing.date}`;
    
    if (isCurrentFull) {
      toggle();
    } else {
      play({
        id: `full-${briefing.date}`,
        title: briefing.fullBriefing.headline,
        audioUrl: briefing.fullBriefing.audioUrl,
        duration: briefing.fullBriefing.duration,
        date: briefing.date,
      });
    }
  };

  // Play Category Brief
  const handlePlayCategory = (category: CategoryBrief) => {
    if (!category.audioUrl) return;
    
    const isCurrentCategory = currentTrack?.id === `${category.category}-${briefing?.date}`;
    
    if (isCurrentCategory) {
      toggle();
    } else {
      play({
        id: `${category.category}-${briefing?.date}`,
        title: `${category.emoji} ${category.displayName}`,
        audioUrl: category.audioUrl,
        duration: category.estimatedDuration,
        date: briefing?.date || "",
      });
    }
  };

  // Toggle favorite
  const toggleFavorite = (story: NewsStory) => {
    const stored = localStorage.getItem("morning-brief-favorites");
    let currentFavorites = [];
    
    try {
      currentFavorites = stored ? JSON.parse(stored) : [];
    } catch (e) {
      currentFavorites = [];
    }
    
    const exists = currentFavorites.find((f: { id: string }) => f.id === story.id);
    
    if (exists) {
      const updated = currentFavorites.filter((f: { id: string }) => f.id !== story.id);
      localStorage.setItem("morning-brief-favorites", JSON.stringify(updated));
      setFavorites(new Set(updated.map((f: { id: string }) => f.id)));
    } else {
      const newFavorite = {
        ...story,
        savedAt: new Date().toISOString(),
        briefingDate: briefing?.date,
      };
      currentFavorites.unshift(newFavorite);
      localStorage.setItem("morning-brief-favorites", JSON.stringify(currentFavorites));
      setFavorites(new Set(currentFavorites.map((f: { id: string }) => f.id)));
    }
  };

  // Scroll to newsletter
  const scrollToNewsletter = () => {
    const element = document.getElementById("newsletter-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const greeting = getGreeting();
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // Loading
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <AnimatedGridBackground />
        <Loader message="Loading today's briefing..." />
      </div>
    );
  }

  // Empty State - COM LOGO PNG
  if (!briefing) {
    return (
      <div className="relative min-h-screen">
        <AnimatedGridBackground />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-16">
          <div className="relative text-center mb-12">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
              <span className="text-[15rem] md:text-[22rem] font-black text-white/[0.03] select-none whitespace-nowrap">
                {greeting.split(" ")[0]}
              </span>
            </div>
            
            <div className="relative">
              <p className="text-[var(--accent-primary)] font-semibold text-lg mb-4 tracking-wider uppercase">
                {today}
              </p>
              <h1 className="text-6xl md:text-8xl font-black text-white mb-4">
                {greeting}
              </h1>
            </div>
          </div>

          <div className="card p-12 text-center max-w-lg mx-auto">
            {/* LOGO PNG */}
            <img 
              src="/icons/logo.png" 
              alt="Morning Brief" 
              className="w-20 h-20 rounded-2xl mx-auto mb-6"
            />
            
            <h2 className="text-2xl font-bold text-white mb-3">No briefing yet today</h2>
            <p className="text-[var(--text-secondary)] mb-8">
              Generate your first multi-category briefing.
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="btn-neumorphic w-full max-w-xs mx-auto"
            >
              {generating ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Generating (~60s)...
                </span>
              ) : (
                "Generate Briefing"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filter stories by category
  const displayStories = selectedCategory
    ? briefing.stories.filter(s => s.category === selectedCategory)
    : briefing.stories;

  // Limit stories shown
  const visibleStories = showAllStories ? displayStories : displayStories.slice(0, 5);
  const hasMoreStories = displayStories.length > 5;

  const isFullPlaying = currentTrack?.id === `full-${briefing.date}` && isPlaying;

  return (
    <div className="relative min-h-screen">
      <AnimatedGridBackground />
      
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        {/* Subscribe Button - Top */}
        <div className="flex justify-center mb-6">
          <button
            onClick={scrollToNewsletter}
            className="px-6 py-2 bg-[var(--accent-green)]/20 border border-[var(--accent-green)]/50 text-[var(--accent-green)] rounded-full text-sm font-semibold hover:bg-[var(--accent-green)]/30 transition-colors flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            Subscribe to Newsletter
          </button>
        </div>

        {/* Listen/Read Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-[var(--bg-elevated)] rounded-full p-1 border border-[var(--border-subtle)]">
            <button
              onClick={() => setReadMode(false)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                !readMode
                  ? "bg-[var(--accent-primary)] text-black"
                  : "text-[var(--text-secondary)] hover:text-white"
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
              Listen
            </button>
            <button
              onClick={() => setReadMode(true)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                readMode
                  ? "bg-[var(--accent-primary)] text-black"
                  : "text-[var(--text-secondary)] hover:text-white"
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/>
              </svg>
              Read
            </button>
          </div>
        </div>

        {/* Hero */}
        <div className="relative text-center mb-8">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden -z-10">
            <span className="text-[12rem] md:text-[20rem] font-black text-white/[0.03] select-none whitespace-nowrap">
              {greeting.split(" ")[0]}
            </span>
          </div>
          
          <p className="text-[var(--accent-primary)] font-semibold text-sm tracking-wider uppercase mb-2">
            {today}
          </p>
          <h1 className="text-5xl md:text-7xl font-black text-white">
            {greeting}
          </h1>
        </div>

        {/* Full Briefing Card */}
        <section className="card p-6 md:p-8 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)]/10 to-transparent pointer-events-none" />

          {!readMode ? (
            /* Audio Mode */
            <div className="relative flex flex-col md:flex-row items-center gap-6">
              <button
                onClick={handlePlayFull}
                disabled={!briefing.fullBriefing?.audioUrl}
                className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50 flex-shrink-0 shadow-2xl shadow-[var(--accent-primary)]/30"
              >
                {isFullPlaying ? (
                  <svg className="w-12 h-12 text-black" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                  </svg>
                ) : (
                  <svg className="w-12 h-12 text-black ml-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>

              <div className="flex-1 text-center md:text-left">
                <span className="inline-block px-3 py-1 bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] text-xs font-bold uppercase tracking-wider rounded-full mb-3">
                  {isFullPlaying ? "Now Playing" : "Full Briefing"}
                </span>

                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {briefing.fullBriefing.headline}
                </h2>

                <p className="text-[var(--text-secondary)] mb-3">
                  {briefing.meta.totalStories} stories • {briefing.fullBriefing.duration} minutes • All categories
                </p>

                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {briefing.categoryBriefs.map(cb => (
                    <span key={cb.category} className="text-lg">
                      {cb.emoji}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Read Mode */
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-block px-3 py-1 bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] text-xs font-bold uppercase tracking-wider rounded-full">
                  Full Briefing
                </span>
                <span className="text-sm text-[var(--text-muted)]">
                  ~{Math.ceil((briefing.fullBriefing.script?.length || 0) / 1000)} min read
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                {briefing.fullBriefing.headline}
              </h2>

              <div className="flex flex-wrap gap-2 mb-6">
                {briefing.categoryBriefs.map(cb => (
                  <span key={cb.category} className="text-lg">
                    {cb.emoji}
                  </span>
                ))}
              </div>

              {briefing.fullBriefing.script ? (
                <div className="prose prose-invert max-w-none">
                  <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-line text-lg">
                    {briefing.fullBriefing.script}
                  </p>
                </div>
              ) : (
                <p className="text-[var(--text-muted)] italic">
                  Text not available for this briefing.
                </p>
              )}
            </div>
          )}
        </section>

        {/* Category Briefs Grid */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <span className="section-label">Category Briefs</span>
            <span className="text-sm text-[var(--text-muted)]">{readMode ? "Click to expand" : "1-2 min each"}</span>
          </div>

          {!readMode ? (
            /* Audio Mode - Grid of play buttons */
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {briefing.categoryBriefs.map(cb => {
                const isCategoryPlaying = currentTrack?.id === `${cb.category}-${briefing.date}` && isPlaying;
                const color = getCategoryColor(cb.category);

                return (
                  <button
                    key={cb.category}
                    onClick={() => handlePlayCategory(cb)}
                    disabled={!cb.audioUrl}
                    className="card p-4 text-left hover:border-white/20 transition-all group disabled:opacity-50"
                    style={{ borderColor: isCategoryPlaying ? color : undefined }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-2xl">{cb.emoji}</span>
                      {cb.audioUrl && (
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                          style={{ backgroundColor: `${color}20` }}
                        >
                          {isCategoryPlaying ? (
                            <svg className="w-4 h-4" fill={color} viewBox="0 0 24 24">
                              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 ml-0.5" fill={color} viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          )}
                        </div>
                      )}
                    </div>

                    <h3 className="font-semibold text-white text-sm mb-1">
                      {cb.displayName}
                    </h3>

                    <p className="text-xs text-[var(--text-muted)] line-clamp-1 mb-2">
                      {cb.headline}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                      <span>{cb.storyCount} stories</span>
                      <span>•</span>
                      <span>{cb.estimatedDuration}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Read Mode - Expandable text cards */
            <div className="space-y-4">
              {briefing.categoryBriefs.map(cb => {
                const color = getCategoryColor(cb.category);

                return (
                  <details
                    key={cb.category}
                    className="card group"
                  >
                    <summary
                      className="p-4 cursor-pointer list-none hover:bg-[var(--bg-elevated)]/50 transition-colors"
                      style={{ borderLeftColor: color, borderLeftWidth: '4px' }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{cb.emoji}</span>
                          <div>
                            <h3 className="font-semibold text-white">
                              {cb.displayName}
                            </h3>
                            <p className="text-sm text-[var(--text-muted)]">
                              {cb.headline}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-[var(--text-muted)]">
                            {cb.storyCount} stories • ~{Math.ceil((cb.script?.length || 0) / 1000)} min read
                          </span>
                          <svg className="w-5 h-5 text-[var(--text-muted)] group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </summary>
                    <div className="px-4 pb-4 pt-2 border-t border-[var(--border-subtle)]">
                      {cb.script ? (
                        <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                          {cb.script}
                        </p>
                      ) : (
                        <p className="text-[var(--text-muted)] italic">
                          Text not available for this category.
                        </p>
                      )}
                    </div>
                  </details>
                );
              })}
            </div>
          )}
        </section>

        {/* Category Filter */}
        <section className="mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => { setSelectedCategory(null); setShowAllStories(false); }}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                !selectedCategory
                  ? "bg-[var(--accent-primary)] text-black"
                  : "bg-[var(--bg-elevated)] text-white hover:bg-[var(--bg-card)]"
              }`}
            >
              All Stories ({briefing.stories.length})
            </button>
            
            {briefing.categoryBriefs.map(cb => (
              <button
                key={cb.category}
                onClick={() => { setSelectedCategory(cb.category); setShowAllStories(false); }}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cb.category
                    ? "text-black"
                    : "bg-[var(--bg-elevated)] text-white hover:bg-[var(--bg-card)]"
                }`}
                style={{
                  backgroundColor: selectedCategory === cb.category ? getCategoryColor(cb.category) : undefined,
                }}
              >
                {cb.emoji} {cb.displayName} ({cb.storyCount})
              </button>
            ))}
          </div>
        </section>

        {/* Stories */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <span className="section-label">
              {selectedCategory 
                ? `${briefing.categoryBriefs.find(c => c.category === selectedCategory)?.displayName} Stories`
                : "All Stories"
              }
            </span>
            <span className="text-sm text-[var(--text-muted)]">Click to expand</span>
          </div>

          <div className="space-y-3">
            {visibleStories.map((story, index) => (
              <ExpandableCard
                key={story.id}
                story={{
                  ...story,
                  formattedDate: formatStoryDate(story.publishedAt),
                }}
                index={index}
                isFavorite={favorites.has(story.id)}
                onToggleFavorite={() => toggleFavorite(story)}
                getCategoryPillClass={getCategoryPillClass}
              />
            ))}
          </div>

          {/* Show More Button */}
          {hasMoreStories && !showAllStories && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowAllStories(true)}
                className="px-6 py-3 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-white rounded-xl hover:bg-[var(--bg-card)] transition-colors font-medium"
              >
                Show All {displayStories.length} Stories
              </button>
            </div>
          )}

          {/* Show Less Button */}
          {showAllStories && hasMoreStories && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowAllStories(false)}
                className="px-6 py-3 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-white rounded-xl hover:bg-[var(--bg-card)] transition-colors font-medium"
              >
                Show Less
              </button>
            </div>
          )}
        </section>

        {/* Newsletter */}
        <section id="newsletter-section" className="mt-16">
          <NewsletterCard />
        </section>

        {/* Generated At */}
        {briefing.generatedAt && (
          <p className="text-center text-xs text-[var(--text-muted)] mt-8">
            Generated at {new Date(briefing.generatedAt).toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}
