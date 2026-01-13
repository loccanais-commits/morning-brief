"use client";

interface Source {
  name: string;
  url?: string;
}

interface BriefingCardProps {
  id: string;
  title: string;
  summary: string;
  category: string;
  duration: string;
  sources: Source[];
  publishedAt: string;
  outlook?: string;
  isLive?: boolean;
  onPlay: (id: string) => void;
  isActive: boolean;
}

const categoryStyles: Record<string, string> = {
  China: "pill-china",
  Russia: "pill-russia",
  "Middle East": "pill-middleeast",
  Europe: "pill-europe",
  Economy: "pill-economy",
  Defense: "pill-defense",
  Trade: "pill-trade",
  Energy: "pill-energy",
};

export default function BriefingCard({
  id,
  title,
  summary,
  category,
  duration,
  sources,
  publishedAt,
  isLive,
  onPlay,
  isActive,
}: BriefingCardProps) {
  const pillClass = categoryStyles[category] || "pill-economy";

  return (
    <article
      onClick={() => onPlay(id)}
      className={`card p-5 cursor-pointer h-full flex flex-col ${
        isActive 
          ? "border-[var(--accent-primary)] bg-[var(--bg-elevated)]" 
          : ""
      }`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onPlay(id)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          {isLive ? (
            <span className="pill pill-live text-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
              LIVE
            </span>
          ) : (
            <span className={`pill ${pillClass}`}>{category}</span>
          )}
        </div>
        
        {/* Play indicator */}
        <button 
          className={`play-btn play-btn-sm flex-shrink-0 ${
            isActive 
              ? "bg-[var(--accent-primary)] text-black" 
              : ""
          }`}
          aria-label={`Play ${title}`}
        >
          {isActive ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
          ) : (
            <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </button>
      </div>
      
      {/* Title */}
      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2 leading-snug line-clamp-2">
        {title}
      </h3>
      
      {/* Summary */}
      <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2 flex-grow">
        {summary}
      </p>
      
      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-3 border-t border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          {/* Duration */}
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {duration}
          </span>
          
          {/* Time ago */}
          <span>{publishedAt}</span>
        </div>
        
        {/* Sources */}
        <span className="text-[var(--text-muted)]">
          {sources.map(s => s.name).slice(0, 2).join(", ")}
        </span>
      </div>
    </article>
  );
}
