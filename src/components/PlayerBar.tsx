"use client";

import { usePlayer } from "@/contexts/PlayerContext";
import { useEffect, useState } from "react";

export default function PlayerBar() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    queue,
    queueIndex,
    toggle,
    next,
    previous,
    seek,
    setVolume,
  } = usePlayer();

  const [showVolume, setShowVolume] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Não mostrar se não tem track
  if (!currentTrack) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const hasNext = queueIndex < queue.length - 1;
  const hasPrevious = queueIndex > 0 || currentTime > 3;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      {/* Spacer para não cobrir conteúdo */}
      <div className="h-20 md:h-24" />
      
      {/* Player Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#181818] border-t border-[#282828]">
        {/* Progress bar clickable */}
        <div 
          className="h-1 bg-[#404040] cursor-pointer group"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            seek(percent * duration);
          }}
        >
          <div 
            className="h-full bg-[var(--accent-primary)] group-hover:bg-[#ffb84d] transition-colors relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="px-4 py-3 flex items-center gap-4">
          {/* Track Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Thumbnail placeholder */}
            <div className="w-12 h-12 rounded bg-[var(--bg-elevated)] flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-[var(--accent-primary)]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
            
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {currentTrack.title}
              </p>
              <p className="text-xs text-[var(--text-muted)] truncate">
                {currentTrack.category || "Daily Briefing"} • {currentTrack.date || "Today"}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Previous */}
            <button
              onClick={previous}
              disabled={!hasPrevious}
              className="p-2 text-[var(--text-secondary)] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors hidden sm:block"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
              </svg>
            </button>

            {/* Play/Pause */}
            <button
              onClick={toggle}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isPlaying ? (
                <svg className="w-5 h-5 md:w-6 md:h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
              ) : (
                <svg className="w-5 h-5 md:w-6 md:h-6 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>

            {/* Next */}
            <button
              onClick={next}
              disabled={!hasNext}
              className="p-2 text-[var(--text-secondary)] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors hidden sm:block"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
              </svg>
            </button>
          </div>

          {/* Time & Volume */}
          <div className="flex items-center gap-3 flex-1 justify-end">
            {/* Time */}
            <span className="text-xs text-[var(--text-muted)] hidden md:block">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {/* Volume */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setShowVolume(!showVolume)}
                className="p-2 text-[var(--text-secondary)] hover:text-white transition-colors"
              >
                {volume === 0 ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                  </svg>
                ) : volume < 0.5 ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                  </svg>
                )}
              </button>
              
              {showVolume && (
                <div className="absolute bottom-full right-0 mb-2 p-3 bg-[#282828] rounded-lg shadow-lg">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-24 accent-[var(--accent-primary)]"
                  />
                </div>
              )}
            </div>

            {/* Queue indicator */}
            {queue.length > 1 && (
              <span className="text-xs text-[var(--text-muted)] hidden lg:block">
                {queueIndex + 1} / {queue.length}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
