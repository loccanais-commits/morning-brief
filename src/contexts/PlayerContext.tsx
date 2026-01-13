"use client";

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";

// === TIPOS ===

interface Track {
  id: string;
  title: string;
  audioUrl: string;
  duration: string;
  category?: string;
  date?: string;
}

interface PlayerContextType {
  // Estado
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  
  // Queue
  queue: Track[];
  queueIndex: number;
  
  // Ações
  play: (track: Track) => void;
  playQueue: (tracks: Track[], startIndex?: number) => void;
  pause: () => void;
  resume: () => void;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  
  // Helpers
  isCurrentTrack: (id: string) => boolean;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

// === PROVIDER ===

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Estado
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  
  // Queue
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);

  // Inicializar audio element
  useEffect(() => {
    if (typeof window !== "undefined" && !audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
      
      // Event listeners
      audioRef.current.addEventListener("timeupdate", () => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      });
      
      audioRef.current.addEventListener("loadedmetadata", () => {
        setDuration(audioRef.current?.duration || 0);
      });
      
      audioRef.current.addEventListener("ended", () => {
        // Auto-play next track
        if (queueIndex < queue.length - 1) {
          playTrackAtIndex(queueIndex + 1);
        } else {
          setIsPlaying(false);
        }
      });
      
      audioRef.current.addEventListener("play", () => setIsPlaying(true));
      audioRef.current.addEventListener("pause", () => setIsPlaying(false));
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Função interna para tocar track por index
  const playTrackAtIndex = useCallback((index: number) => {
    if (index >= 0 && index < queue.length) {
      const track = queue[index];
      setQueueIndex(index);
      setCurrentTrack(track);
      
      if (audioRef.current && track.audioUrl) {
        audioRef.current.src = track.audioUrl;
        audioRef.current.play().catch(console.error);
      }
    }
  }, [queue]);

  // Play single track
  const play = useCallback((track: Track) => {
    setQueue([track]);
    setQueueIndex(0);
    setCurrentTrack(track);
    
    if (audioRef.current && track.audioUrl) {
      audioRef.current.src = track.audioUrl;
      audioRef.current.play().catch(console.error);
    }
  }, []);

  // Play queue of tracks
  const playQueue = useCallback((tracks: Track[], startIndex = 0) => {
    if (tracks.length === 0) return;
    
    setQueue(tracks);
    setQueueIndex(startIndex);
    setCurrentTrack(tracks[startIndex]);
    
    if (audioRef.current && tracks[startIndex].audioUrl) {
      audioRef.current.src = tracks[startIndex].audioUrl;
      audioRef.current.play().catch(console.error);
    }
  }, []);

  // Pause
  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  // Resume
  const resume = useCallback(() => {
    audioRef.current?.play().catch(console.error);
  }, []);

  // Toggle play/pause
  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  }, [isPlaying, pause, resume]);

  // Next track
  const next = useCallback(() => {
    if (queueIndex < queue.length - 1) {
      playTrackAtIndex(queueIndex + 1);
    }
  }, [queueIndex, queue.length, playTrackAtIndex]);

  // Previous track
  const previous = useCallback(() => {
    if (currentTime > 3) {
      // Se passou de 3s, volta pro início
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    } else if (queueIndex > 0) {
      playTrackAtIndex(queueIndex - 1);
    }
  }, [currentTime, queueIndex, playTrackAtIndex]);

  // Seek
  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, []);

  // Set volume
  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  }, []);

  // Check if track is current
  const isCurrentTrack = useCallback((id: string) => {
    return currentTrack?.id === id;
  }, [currentTrack]);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        queue,
        queueIndex,
        play,
        playQueue,
        pause,
        resume,
        toggle,
        next,
        previous,
        seek,
        setVolume,
        isCurrentTrack,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

// === HOOK ===

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
