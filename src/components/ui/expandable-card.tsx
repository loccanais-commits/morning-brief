"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "@/hooks/use-outside-click";

interface NewsStory {
  id: string;
  title: string;
  summary: string;
  category: string;
  source: string;
  sourceUrl: string;
  imageUrl?: string;
  publishedAt?: string;
  formattedDate?: string;
}

interface ExpandableCardProps {
  story: NewsStory;
  index: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  getCategoryPillClass: (category: string) => string;
}

export function ExpandableCard({
  story,
  index,
  isFavorite,
  onToggleFavorite,
  getCategoryPillClass,
}: ExpandableCardProps) {
  const [isActive, setIsActive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsActive(false);
      }
    }

    if (isActive) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isActive]);

  useOutsideClick(ref, () => setIsActive(false));

  // Placeholder image if none provided
  const imageUrl = story.imageUrl || `https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=400&fit=crop`;

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm h-full w-full z-40"
          />
        )}
      </AnimatePresence>

      {/* Expanded Card Modal */}
      <AnimatePresence>
        {isActive && (
          <div className="fixed inset-0 grid place-items-center z-50 p-4">
            <motion.button
              key={`close-${story.id}-${id}`}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.05 } }}
              className="flex absolute top-4 right-4 lg:top-8 lg:right-8 items-center justify-center bg-white rounded-full h-10 w-10 z-50 shadow-lg"
              onClick={() => setIsActive(false)}
            >
              <CloseIcon />
            </motion.button>
            
            <motion.div
              layoutId={`card-${story.id}-${id}`}
              ref={ref}
              className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-[var(--bg-card)] rounded-3xl overflow-hidden border border-[var(--border-subtle)]"
            >
              {/* Image */}
              <motion.div layoutId={`image-${story.id}-${id}`}>
                <img
                  src={imageUrl}
                  alt={story.title}
                  className="w-full h-64 md:h-80 object-cover"
                />
              </motion.div>

              {/* Content */}
              <div className="flex-1 overflow-auto">
                <div className="flex justify-between items-start p-6 gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`pill ${getCategoryPillClass(story.category)}`}>
                        {story.category}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">
                        {story.source}
                      </span>
                    </div>
                    <motion.h3
                      layoutId={`title-${story.id}-${id}`}
                      className="text-2xl font-bold text-white"
                    >
                      {story.title}
                    </motion.h3>
                  </div>

                  <motion.button
                    layoutId={`favorite-${story.id}-${id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite();
                    }}
                    className={`p-3 rounded-full transition-colors flex-shrink-0 ${
                      isFavorite
                        ? "text-[#FB923C] bg-[#FB923C]/20"
                        : "text-[var(--text-muted)] bg-[var(--bg-elevated)] hover:text-[#FB923C]"
                    }`}
                  >
                    <svg 
                      width="24" 
                      height="24" 
                      viewBox="0 0 24 24" 
                      fill={isFavorite ? "currentColor" : "none"} 
                      stroke="currentColor" 
                      strokeWidth="2"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  </motion.button>
                </div>

                <div className="px-6 pb-6">
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-[var(--text-secondary)] leading-relaxed"
                  >
                    <p>{story.summary}</p>
                  </motion.div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-6">
                    {story.sourceUrl && (
                      <a
                        href={story.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-3 px-6 bg-[var(--accent-primary)] hover:bg-[#ffb84d] text-black font-semibold rounded-xl text-center transition-colors"
                      >
                        Read Full Story →
                      </a>
                    )}
                    <button
                      onClick={() => setIsActive(false)}
                      className="py-3 px-6 bg-[var(--bg-elevated)] hover:bg-[var(--bg-secondary)] text-white rounded-xl transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Card Preview */}
      <motion.div
        layoutId={`card-${story.id}-${id}`}
        onClick={() => setIsActive(true)}
        className="card p-4 cursor-pointer group hover:border-[var(--accent-primary)] transition-all animate-in"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div className="flex gap-4">
          {/* Thumbnail */}
          <motion.div 
            layoutId={`image-${story.id}-${id}`}
            className="flex-shrink-0"
          >
            <img
              src={imageUrl}
              alt={story.title}
              className="w-20 h-20 md:w-24 md:h-24 rounded-xl object-cover"
            />
          </motion.div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-bold text-[var(--accent-primary)]">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className={`pill text-xs ${getCategoryPillClass(story.category)}`}>
                {story.category}
              </span>
            </div>
            
            <motion.h3
              layoutId={`title-${story.id}-${id}`}
              className="text-base md:text-lg font-semibold text-white mb-1 line-clamp-2 group-hover:text-[var(--accent-primary)] transition-colors"
            >
              {story.title}
            </motion.h3>
            
            <p className="text-sm text-[var(--text-muted)] line-clamp-1">
              {story.source}
              {story.formattedDate && (
                <span className="ml-2">• {story.formattedDate}</span>
              )}
            </p>
          </div>

          {/* Favorite Button */}
          <motion.button
            layoutId={`favorite-${story.id}-${id}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className={`p-2 rounded-lg transition-colors flex-shrink-0 self-center ${
              isFavorite
                ? "text-[#FB923C] bg-[#FB923C]/10"
                : "text-[var(--text-muted)] hover:text-[#FB923C] hover:bg-[#FB923C]/10"
            }`}
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill={isFavorite ? "currentColor" : "none"} 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}

// Close Icon
const CloseIcon = () => {
  return (
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.05 } }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 text-black"
    >
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </motion.svg>
  );
};
