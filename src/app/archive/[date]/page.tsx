"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { usePlayer } from "@/contexts/PlayerContext";
import Loader from "@/components/Loader";

interface CategoryBrief {
  category: string;
  displayName: string;
  emoji: string;
  headline: string;
  script?: string;
  audioUrl?: string;
  storyCount: number;
  estimatedDuration: string;
}

interface NewsStory {
  id: string;
  title: string;
  summary: string;
  category: string;
  source: string;
  sourceUrl: string;
  imageUrl?: string;
}

interface FullBriefing {
  date: string;
  generatedAt: string;
  fullBriefing: {
    headline: string;
    script?: string;
    audioUrl?: string;
    duration: string;
    storyCount: number;
  };
  categoryBriefs: CategoryBrief[];
  stories: NewsStory[];
  meta: {
    totalStories: number;
    categoryCounts: Record<string, number>;
  };
}

// Cor da categoria
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

export default function BriefingDatePage() {
  const params = useParams();
  const router = useRouter();
  const dateParam = params.date as string;

  const { play, isPlaying, currentTrack, toggle } = usePlayer();

  const [briefing, setBriefing] = useState<FullBriefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readMode, setReadMode] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [availableDates, setAvailableDates] = useState<string[]>([]);

  // Fetch briefing data
  useEffect(() => {
    async function fetchBriefing() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/briefings?date=${dateParam}`);
        const data = await res.json();

        if (data.success && data.briefing) {
          setBriefing(data.briefing);
        } else {
          setError("Briefing not found for this date");
        }
      } catch (err) {
        console.error("Failed to fetch briefing:", err);
        setError("Failed to load briefing");
      } finally {
        setLoading(false);
      }
    }

    // Fetch available dates for navigation
    async function fetchDates() {
      try {
        const res = await fetch("/api/briefings?history=true");
        const data = await res.json();
        if (data.success && data.history) {
          setAvailableDates(data.history.map((b: { date: string }) => b.date).sort());
        }
      } catch {
        console.error("Failed to fetch dates");
      }
    }

    if (dateParam) {
      fetchBriefing();
      fetchDates();
    }
  }, [dateParam]);

  // Navigation helpers
  const currentIndex = availableDates.indexOf(dateParam);
  const prevDate = currentIndex > 0 ? availableDates[currentIndex - 1] : null;
  const nextDate = currentIndex < availableDates.length - 1 ? availableDates[currentIndex + 1] : null;

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  // Play handlers
  const handlePlayFull = () => {
    if (!briefing?.fullBriefing?.audioUrl) return;

    const trackId = `full-${briefing.date}`;
    if (currentTrack?.id === trackId) {
      toggle();
    } else {
      play({
        id: trackId,
        title: briefing.fullBriefing.headline,
        audioUrl: briefing.fullBriefing.audioUrl,
        duration: briefing.fullBriefing.duration,
        date: briefing.date,
      });
    }
  };

  const handlePlayCategory = (category: CategoryBrief) => {
    if (!category.audioUrl || !briefing) return;

    const trackId = `${category.category}-${briefing.date}`;
    if (currentTrack?.id === trackId) {
      toggle();
    } else {
      play({
        id: trackId,
        title: `${category.emoji} ${category.displayName}`,
        audioUrl: category.audioUrl,
        duration: category.estimatedDuration,
        date: briefing.date,
      });
    }
  };

  const isFullPlaying = briefing && currentTrack?.id === `full-${briefing.date}` && isPlaying;

  // Format date for display
  const formattedDate = dateParam
    ? new Date(dateParam + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader message="Loading briefing..." />
      </main>
    );
  }

  if (error || !briefing) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Briefing Not Found</h1>
          <p className="text-[var(--text-muted)] mb-6">{error || "No briefing available for this date"}</p>
          <Link
            href="/archive"
            className="px-6 py-3 bg-[var(--accent-primary)] text-black font-semibold rounded-xl hover:bg-[#ffb84d] transition-colors"
          >
            Back to Archive
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/archive"
            className="flex items-center gap-2 text-[var(--text-muted)] hover:text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Back to Archive
          </Link>

          {/* Date Navigation */}
          <div className="flex items-center gap-2">
            {prevDate ? (
              <button
                onClick={() => router.push(`/archive/${prevDate}`)}
                className="p-2 bg-[var(--bg-elevated)] hover:bg-[var(--bg-card)] rounded-lg transition-colors"
                title={`Previous: ${prevDate}`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
              </button>
            ) : (
              <div className="w-9 h-9" />
            )}

            {nextDate ? (
              <button
                onClick={() => router.push(`/archive/${nextDate}`)}
                className="p-2 bg-[var(--bg-elevated)] hover:bg-[var(--bg-card)] rounded-lg transition-colors"
                title={`Next: ${nextDate}`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>
            ) : (
              <div className="w-9 h-9" />
            )}
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <p className="text-[var(--accent-primary)] font-medium mb-2">{formattedDate}</p>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            {briefing.fullBriefing.headline}
          </h1>
        </div>

        {/* Listen/Read Toggle */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex bg-[var(--bg-elevated)] rounded-xl p-1">
            <button
              onClick={() => setReadMode(false)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                !readMode
                  ? "bg-[var(--accent-primary)] text-black"
                  : "text-[var(--text-muted)] hover:text-white"
              }`}
            >
              <span className="flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3c-4.97 0-9 4.03-9 9v7c0 1.1.9 2 2 2h4v-8H5v-1c0-3.87 3.13-7 7-7s7 3.13 7 7v1h-4v8h4c1.1 0 2-.9 2-2v-7c0-4.97-4.03-9-9-9z"/>
                </svg>
                Listen
              </span>
            </button>
            <button
              onClick={() => setReadMode(true)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                readMode
                  ? "bg-[var(--accent-primary)] text-black"
                  : "text-[var(--text-muted)] hover:text-white"
              }`}
            >
              <span className="flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/>
                </svg>
                Read
              </span>
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
            <span>{briefing.meta.totalStories} stories</span>
            <span>•</span>
            <span>{briefing.fullBriefing.duration}</span>
          </div>
        </div>

        {/* Main Content */}
        {!readMode ? (
          // LISTEN MODE
          <div className="space-y-6">
            {/* Play Full Button */}
            {briefing.fullBriefing.audioUrl && (
              <button
                onClick={handlePlayFull}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-[var(--accent-primary)] hover:bg-[#ffb84d] text-black font-semibold rounded-xl transition-colors"
              >
                {isFullPlaying ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
                {isFullPlaying ? "Pause" : "Play Full Briefing"}
                <span className="text-sm opacity-70">({briefing.fullBriefing.duration})</span>
              </button>
            )}

            {/* Category Audio Players */}
            <div className="grid gap-3 md:grid-cols-2">
              {briefing.categoryBriefs.map((cb) => {
                const isCatPlaying = currentTrack?.id === `${cb.category}-${briefing.date}` && isPlaying;
                const color = getCategoryColor(cb.category);

                return (
                  <button
                    key={cb.category}
                    onClick={() => handlePlayCategory(cb)}
                    disabled={!cb.audioUrl}
                    className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-left hover:border-[var(--accent-primary)] transition-all disabled:opacity-50 flex items-center gap-3"
                    style={{ borderLeftWidth: "4px", borderLeftColor: color }}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      {isCatPlaying ? (
                        <svg className="w-6 h-6" fill={color} viewBox="0 0 24 24">
                          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 ml-0.5" fill={color} viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-lg font-medium text-white">
                        {cb.emoji} {cb.displayName}
                      </p>
                      <p className="text-sm text-[var(--text-muted)] truncate">
                        {cb.headline}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        {cb.storyCount} stories • {cb.estimatedDuration}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          // READ MODE
          <div className="space-y-6">
            {/* Full Briefing Script */}
            {briefing.fullBriefing.script && (
              <div className="card p-6">
                <h2 className="text-xl font-bold text-white mb-4">Full Briefing</h2>
                <div className="prose prose-invert max-w-none">
                  <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                    {briefing.fullBriefing.script}
                  </p>
                </div>
              </div>
            )}

            {/* Category Scripts as Accordions */}
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-white">Category Briefs</h2>
              {briefing.categoryBriefs.map((cb) => {
                const isExpanded = expandedCategories.has(cb.category);
                const color = getCategoryColor(cb.category);

                return (
                  <div
                    key={cb.category}
                    className="card overflow-hidden"
                    style={{ borderLeftWidth: "4px", borderLeftColor: color }}
                  >
                    <button
                      onClick={() => toggleCategory(cb.category)}
                      className="w-full p-4 flex items-center justify-between hover:bg-[var(--bg-elevated)] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{cb.emoji}</span>
                        <div className="text-left">
                          <h3 className="font-semibold text-white">{cb.displayName}</h3>
                          <p className="text-sm text-[var(--text-muted)]">{cb.headline}</p>
                        </div>
                      </div>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className={`text-[var(--text-muted)] transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      >
                        <path d="m6 9 6 6 6-6"/>
                      </svg>
                    </button>

                    {isExpanded && cb.script && (
                      <div className="px-4 pb-4 pt-2 border-t border-[var(--border-subtle)]">
                        <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                          {cb.script}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Stories List */}
            {briefing.stories && briefing.stories.length > 0 && (
              <div className="card p-6">
                <h2 className="text-xl font-bold text-white mb-4">All Stories</h2>
                <div className="space-y-4">
                  {briefing.stories.map((story, idx) => (
                    <div
                      key={story.id || idx}
                      className="p-4 bg-[var(--bg-elevated)] rounded-lg"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className="text-sm font-bold px-2 py-1 rounded"
                          style={{
                            backgroundColor: `${getCategoryColor(story.category)}20`,
                            color: getCategoryColor(story.category)
                          }}
                        >
                          {story.category}
                        </span>
                        <div className="flex-1">
                          <h3 className="font-medium text-white">{story.title}</h3>
                          {story.summary && (
                            <p className="text-sm text-[var(--text-muted)] mt-1 line-clamp-2">
                              {story.summary}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text-muted)]">
                            <span>{story.source}</span>
                            {story.sourceUrl && (
                              <a
                                href={story.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[var(--accent-primary)] hover:underline"
                              >
                                Read more →
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Ad Space Placeholder */}
        <div className="mt-12 p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-center">
          <p className="text-[var(--text-muted)] text-sm">Advertisement</p>
          <div className="h-24 flex items-center justify-center">
            <span className="text-[var(--text-muted)]">Ad Space</span>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="mt-8 flex items-center justify-between">
          {prevDate ? (
            <Link
              href={`/archive/${prevDate}`}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-elevated)] hover:bg-[var(--bg-card)] rounded-lg transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6"/>
              </svg>
              <span className="text-[var(--text-secondary)]">
                {new Date(prevDate + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </Link>
          ) : (
            <div />
          )}

          <Link
            href="/archive"
            className="px-4 py-2 text-[var(--text-muted)] hover:text-white transition-colors"
          >
            View All
          </Link>

          {nextDate ? (
            <Link
              href={`/archive/${nextDate}`}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-elevated)] hover:bg-[var(--bg-card)] rounded-lg transition-colors"
            >
              <span className="text-[var(--text-secondary)]">
                {new Date(nextDate + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    </main>
  );
}
