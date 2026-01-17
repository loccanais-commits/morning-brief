"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePlayer } from "@/contexts/PlayerContext";
import Loader from "@/components/Loader";

interface BriefingPreview {
  date: string;
  headline: string;
  storyCount: number;
  duration?: string;
  categoryCount: number;
}

interface CategoryBrief {
  category: string;
  displayName: string;
  emoji: string;
  headline: string;
  audioUrl?: string;
  storyCount: number;
  estimatedDuration: string;
}

interface FullBriefing {
  date: string;
  generatedAt: string;
  fullBriefing: {
    headline: string;
    audioUrl?: string;
    duration: string;
    storyCount: number;
  };
  categoryBriefs: CategoryBrief[];
  stories: Array<{ title: string; category: string }>;
  meta: {
    totalStories: number;
    categoryCounts: Record<string, number>;
  };
  // Formato antigo (fallback)
  dailySummary?: {
    title: string;
    audioUrl?: string;
    duration: string;
  };
}

interface CalendarDay {
  date: Date;
  dateString: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasBriefing: boolean;
}

// Helper para gerar dias do calendário
function generateCalendarDays(year: number, month: number, briefingDates: Set<string>): CalendarDay[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const days: CalendarDay[] = [];
  
  // Dias do mês anterior
  const startDayOfWeek = firstDay.getDay();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month, -i);
    const dateString = date.toISOString().split("T")[0];
    days.push({
      date,
      dateString,
      isCurrentMonth: false,
      isToday: false,
      hasBriefing: briefingDates.has(dateString),
    });
  }
  
  // Dias do mês atual
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day);
    const dateString = date.toISOString().split("T")[0];
    days.push({
      date,
      dateString,
      isCurrentMonth: true,
      isToday: date.getTime() === today.getTime(),
      hasBriefing: briefingDates.has(dateString),
    });
  }
  
  // Dias do próximo mês (só o necessário para completar 5-6 semanas)
  const totalDays = days.length <= 35 ? 35 : 42;
  const remainingDays = totalDays - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i);
    const dateString = date.toISOString().split("T")[0];
    days.push({
      date,
      dateString,
      isCurrentMonth: false,
      isToday: false,
      hasBriefing: briefingDates.has(dateString),
    });
  }
  
  return days;
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

export default function ArchivePage() {
  const router = useRouter();
  const { play, isPlaying, currentTrack, toggle } = usePlayer();

  const [loading, setLoading] = useState(true);
  const [briefings, setBriefings] = useState<BriefingPreview[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedBriefing, setSelectedBriefing] = useState<FullBriefing | null>(null);
  const [loadingBriefing, setLoadingBriefing] = useState(false);
  
  // Calendar state
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  
  // Buscar lista de briefings
  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch("/api/briefings?history=true");
        const data = await res.json();
        
        if (data.success && data.history) {
          setBriefings(data.history);
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchHistory();
  }, []);

  // Buscar briefing específico
  useEffect(() => {
    async function fetchBriefing() {
      if (!selectedDate) {
        setSelectedBriefing(null);
        return;
      }
      
      setLoadingBriefing(true);
      try {
        const res = await fetch(`/api/briefings?date=${selectedDate}`);
        const data = await res.json();
        
        if (data.success && data.briefing) {
          setSelectedBriefing(data.briefing);
        } else {
          setSelectedBriefing(null);
        }
      } catch (error) {
        console.error("Failed to fetch briefing:", error);
        setSelectedBriefing(null);
      } finally {
        setLoadingBriefing(false);
      }
    }
    
    fetchBriefing();
  }, [selectedDate]);

  // Set de datas com briefing
  const briefingDates = new Set(briefings.map(b => b.date));
  
  // Gerar dias do calendário
  const calendarDays = generateCalendarDays(viewYear, viewMonth, briefingDates);
  
  // Navegação
  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };
  
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };
  
  const monthName = new Date(viewYear, viewMonth).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Play Full Briefing
  const handlePlayFull = () => {
    if (!selectedBriefing) return;
    
    const audioUrl = selectedBriefing.fullBriefing?.audioUrl || selectedBriefing.dailySummary?.audioUrl;
    const title = selectedBriefing.fullBriefing?.headline || selectedBriefing.dailySummary?.title || "Daily Briefing";
    const duration = selectedBriefing.fullBriefing?.duration || selectedBriefing.dailySummary?.duration || "2:00";
    
    if (!audioUrl) return;
    
    const trackId = `full-${selectedBriefing.date}`;
    
    if (currentTrack?.id === trackId) {
      toggle();
    } else {
      play({
        id: trackId,
        title,
        audioUrl,
        duration,
        date: selectedBriefing.date,
      });
    }
  };

  // Play Category Brief
  const handlePlayCategory = (category: CategoryBrief) => {
    if (!category.audioUrl || !selectedBriefing) return;
    
    const trackId = `${category.category}-${selectedBriefing.date}`;
    
    if (currentTrack?.id === trackId) {
      toggle();
    } else {
      play({
        id: trackId,
        title: `${category.emoji} ${category.displayName}`,
        audioUrl: category.audioUrl,
        duration: category.estimatedDuration,
        date: selectedBriefing.date,
      });
    }
  };

  // Verificar se está tocando
  const isFullPlaying = selectedBriefing && currentTrack?.id === `full-${selectedBriefing.date}` && isPlaying;

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader message="Loading archive..." />
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <span className="section-label">Archive</span>
          <h1 className="text-3xl md:text-4xl font-bold text-white mt-4">
            Past Briefings
          </h1>
          <p className="text-[var(--text-secondary)] mt-2">
            Browse and listen to previous daily briefings
          </p>
        </div>

        {/* Main Grid - Stack on mobile */}
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6">
          {/* Calendar */}
          <div className="card p-4 md:p-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-[var(--bg-elevated)] rounded-lg transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
              </button>
              <h2 className="text-lg md:text-xl font-semibold text-white">{monthName}</h2>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-[var(--bg-elevated)] rounded-lg transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                <div key={i} className="text-center text-xs md:text-sm font-medium text-[var(--text-muted)] py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => (
                <button
                  key={index}
                  onClick={() => day.hasBriefing && router.push(`/archive/${day.dateString}`)}
                  disabled={!day.hasBriefing}
                  className={`
                    aspect-square p-1 md:p-2 rounded-lg text-xs md:text-sm font-medium transition-all relative
                    ${!day.isCurrentMonth ? "opacity-30" : ""}
                    ${day.isToday ? "ring-2 ring-[var(--accent-primary)]" : ""}
                    ${day.hasBriefing ? "bg-[var(--bg-elevated)] hover:bg-[var(--bg-card)] cursor-pointer text-white" : ""}
                    ${!day.hasBriefing ? "cursor-default text-[var(--text-muted)]" : ""}
                  `}
                >
                  {day.date.getDate()}
                  {day.hasBriefing && (
                    <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-[var(--accent-primary)]" />
                  )}
                </button>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center justify-center gap-4 text-xs md:text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-[var(--accent-primary)]" />
                <span className="text-[var(--text-muted)]">Has briefing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 md:w-3 md:h-3 rounded ring-2 ring-[var(--accent-primary)]" />
                <span className="text-[var(--text-muted)]">Today</span>
              </div>
            </div>
          </div>

          {/* Selected Briefing Preview */}
          <div className="card p-4 md:p-6 max-h-[600px] overflow-y-auto">
            {!selectedDate ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--text-muted)]">
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                    <line x1="16" x2="16" y1="2" y2="6"/>
                    <line x1="8" x2="8" y1="2" y2="6"/>
                    <line x1="3" x2="21" y1="10" y2="10"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Select a Date</h3>
                <p className="text-[var(--text-muted)] text-sm">
                  Click on a highlighted date to preview
                </p>
              </div>
            ) : loadingBriefing ? (
              <div className="h-full flex items-center justify-center py-12">
                <div className="loader" />
              </div>
            ) : selectedBriefing ? (
              <div className="space-y-5">
                {/* Date & Title */}
                <div>
                  <p className="text-sm text-[var(--accent-primary)] font-medium">
                    {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <h3 className="text-lg md:text-xl font-bold text-white mt-1">
                    {selectedBriefing.fullBriefing?.headline || selectedBriefing.dailySummary?.title || "Daily Briefing"}
                  </h3>
                </div>

                {/* Play Full Button */}
                {(selectedBriefing.fullBriefing?.audioUrl || selectedBriefing.dailySummary?.audioUrl) && (
                  <button
                    onClick={handlePlayFull}
                    className="w-full flex items-center justify-center gap-3 py-3 md:py-4 px-4 md:px-6 bg-[var(--accent-primary)] hover:bg-[#ffb84d] text-black font-semibold rounded-xl transition-colors"
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
                    <span className="text-sm opacity-70">
                      ({selectedBriefing.fullBriefing?.duration || selectedBriefing.dailySummary?.duration || "2:00"})
                    </span>
                  </button>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-[var(--bg-elevated)] rounded-lg text-center">
                    <p className="text-xl md:text-2xl font-bold text-white">
                      {selectedBriefing.stories?.length || selectedBriefing.meta?.totalStories || 0}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">Stories</p>
                  </div>
                  <div className="p-3 bg-[var(--bg-elevated)] rounded-lg text-center">
                    <p className="text-xl md:text-2xl font-bold text-white">
                      {selectedBriefing.fullBriefing?.duration || selectedBriefing.dailySummary?.duration || "2:00"}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">Duration</p>
                  </div>
                </div>

                {/* Category Briefs */}
                {selectedBriefing.categoryBriefs && selectedBriefing.categoryBriefs.length > 0 && (
                  <div>
                    <p className="text-sm text-[var(--text-muted)] mb-3">Category Briefs</p>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedBriefing.categoryBriefs.map((cb) => {
                        const isCatPlaying = currentTrack?.id === `${cb.category}-${selectedBriefing.date}` && isPlaying;
                        const color = getCategoryColor(cb.category);
                        
                        return (
                          <button
                            key={cb.category}
                            onClick={() => handlePlayCategory(cb)}
                            disabled={!cb.audioUrl}
                            className="p-3 bg-[var(--bg-elevated)] rounded-lg text-left hover:bg-[var(--bg-card)] transition-colors disabled:opacity-50 flex items-center gap-2"
                            style={{ borderLeft: `3px solid ${color}` }}
                          >
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: `${color}20` }}
                            >
                              {isCatPlaying ? (
                                <svg className="w-4 h-4" fill={color} viewBox="0 0 24 24">
                                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                                </svg>
                              ) : (
                                <svg className="w-4 h-4 ml-0.5" fill={color} viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z"/>
                                </svg>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-white truncate">
                                {cb.emoji} {cb.displayName}
                              </p>
                              <p className="text-xs text-[var(--text-muted)]">
                                {cb.estimatedDuration}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Stories Preview */}
                {selectedBriefing.stories && selectedBriefing.stories.length > 0 && (
                  <div>
                    <p className="text-sm text-[var(--text-muted)] mb-2">Headlines</p>
                    <ul className="space-y-1.5">
                      {selectedBriefing.stories.slice(0, 5).map((story, i) => (
                        <li key={i} className="text-sm text-[var(--text-secondary)] truncate">
                          • {story.title}
                        </li>
                      ))}
                      {selectedBriefing.stories.length > 5 && (
                        <li className="text-sm text-[var(--text-muted)]">
                          +{selectedBriefing.stories.length - 5} more stories
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <p className="text-[var(--text-muted)]">
                  No briefing found for this date
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Briefings List */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-white mb-6">Recent Briefings</h2>

          {briefings.length === 0 ? (
            <p className="text-[var(--text-muted)]">No briefings available yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {briefings.slice(0, 12).map((briefing) => (
                <button
                  key={briefing.date}
                  onClick={() => router.push(`/archive/${briefing.date}`)}
                  className="card p-4 text-left hover:border-[var(--accent-primary)] transition-colors"
                >
                  <p className="text-sm text-[var(--accent-primary)] font-medium">
                    {new Date(briefing.date + "T12:00:00").toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <h3 className="text-white font-medium mt-1 truncate">
                    {briefing.headline || "Daily Briefing"}
                  </h3>
                  <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text-muted)]">
                    <span>{briefing.storyCount} stories</span>
                    {briefing.duration && <span>• {briefing.duration}</span>}
                    {briefing.categoryCount > 0 && <span>• {briefing.categoryCount} categories</span>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
