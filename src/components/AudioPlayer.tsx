"use client";

import { useState, useRef, useEffect } from "react";

interface AudioPlayerProps {
  src: string;
  title: string;
  duration?: string;
}

// Fixed waveform values to avoid hydration mismatch
const WAVEFORM_BARS = [
  0.65, 0.82, 0.45, 0.73, 0.58, 0.91, 0.67, 0.54, 0.78, 0.63,
  0.88, 0.71, 0.49, 0.85, 0.62, 0.77, 0.53, 0.94, 0.68, 0.81,
  0.56, 0.72, 0.89, 0.61, 0.75, 0.48, 0.83, 0.69, 0.57, 0.92,
  0.64, 0.79, 0.51, 0.86, 0.73, 0.59, 0.84, 0.66, 0.76, 0.52,
  0.87, 0.70, 0.55, 0.80, 0.63, 0.74, 0.58, 0.90, 0.67, 0.82,
];

export default function AudioPlayer({ src, duration }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setTotalDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !totalDuration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.currentTime = percent * totalDuration;
  };

  const changeSpeed = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const speeds = [0.75, 1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % speeds.length;
    const newRate = speeds[nextIndex];
    
    audio.playbackRate = newRate;
    setPlaybackRate(newRate);
  };

  const skip = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(totalDuration, audio.currentTime + seconds));
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = totalDuration ? (currentTime / totalDuration) * 100 : 0;
  const activeBarIndex = Math.floor((progress / 100) * WAVEFORM_BARS.length);

  return (
    <div className="audio-player">
      <audio ref={audioRef} src={src} preload="metadata" />
      
      {/* Waveform Visualization */}
      <div 
        className="flex items-center justify-center gap-[3px] h-16 sm:h-20 cursor-pointer mb-6"
        onClick={handleSeek}
        role="slider"
        aria-label="Audio progress"
        aria-valuenow={currentTime}
        aria-valuemax={totalDuration}
        tabIndex={0}
      >
        {WAVEFORM_BARS.map((height, i) => (
          <div
            key={i}
            className={`w-1 sm:w-[3px] rounded-full transition-all duration-100 ${
              i <= activeBarIndex ? 'bg-[var(--accent-primary)]' : 'bg-[var(--text-muted)]'
            }`}
            style={{ 
              height: `${height * 100}%`,
              opacity: i <= activeBarIndex ? 1 : 0.3
            }}
          />
        ))}
      </div>
      
      {/* Time Display */}
      <div className="flex justify-between text-sm text-[var(--text-muted)] mb-8">
        <span className="font-mono">{formatTime(currentTime)}</span>
        <span className="font-mono">{duration || formatTime(totalDuration)}</span>
      </div>
      
      {/* Controls - Mobile optimized */}
      <div className="flex items-center justify-center gap-4 sm:gap-6">
        {/* Shuffle/Repeat placeholder */}
        <button className="control-btn hidden sm:flex opacity-50" disabled>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        {/* Skip Back */}
        <button
          onClick={() => skip(-15)}
          className="w-12 h-12 sm:w-11 sm:h-11 rounded-full bg-transparent text-[var(--text-secondary)] flex items-center justify-center hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-all"
          aria-label="Skip back 15 seconds"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
          </svg>
        </button>
        
        {/* Play/Pause */}
        <button
          onClick={togglePlay}
          className="w-16 h-16 sm:w-14 sm:h-14 rounded-full bg-[var(--text-primary)] text-[var(--bg-primary)] flex items-center justify-center hover:scale-105 transition-transform"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
          ) : (
            <svg className="w-7 h-7 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </button>
        
        {/* Skip Forward */}
        <button
          onClick={() => skip(15)}
          className="w-12 h-12 sm:w-11 sm:h-11 rounded-full bg-transparent text-[var(--text-secondary)] flex items-center justify-center hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-all"
          aria-label="Skip forward 15 seconds"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
          </svg>
        </button>
        
        {/* Speed Control */}
        <button
          onClick={changeSpeed}
          className="w-12 h-12 sm:w-11 sm:h-11 rounded-full bg-transparent text-[var(--text-secondary)] flex items-center justify-center hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-all text-sm font-semibold"
          aria-label={`Playback speed: ${playbackRate}x`}
        >
          {playbackRate}x
        </button>
      </div>
    </div>
  );
}
