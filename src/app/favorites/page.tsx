"use client";

import { useState, useEffect } from "react";
import { usePlayer } from "@/contexts/PlayerContext";

interface FavoriteStory {
  id: string;
  title: string;
  summary: string;
  category: string;
  source: string;
  sourceUrl: string;
  savedAt: string;
  briefingDate: string;
}

// Hook para gerenciar favoritos no localStorage
function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteStory[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Carregar do localStorage
  useEffect(() => {
    const stored = localStorage.getItem("morning-brief-favorites");
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse favorites:", e);
      }
    }
    setLoaded(true);
  }, []);

  // Salvar no localStorage
  useEffect(() => {
    if (loaded) {
      localStorage.setItem("morning-brief-favorites", JSON.stringify(favorites));
    }
  }, [favorites, loaded]);

  const addFavorite = (story: Omit<FavoriteStory, "savedAt">) => {
    if (!favorites.find((f) => f.id === story.id)) {
      setFavorites([
        { ...story, savedAt: new Date().toISOString() },
        ...favorites,
      ]);
    }
  };

  const removeFavorite = (id: string) => {
    setFavorites(favorites.filter((f) => f.id !== id));
  };

  const isFavorite = (id: string) => {
    return favorites.some((f) => f.id === id);
  };

  const clearAll = () => {
    setFavorites([]);
  };

  return { favorites, addFavorite, removeFavorite, isFavorite, clearAll, loaded };
}

// Exportar hook para usar em outros componentes
export { useFavorites };

export default function FavoritesPage() {
  const { favorites, removeFavorite, clearAll, loaded } = useFavorites();
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  const getCategoryPillClass = (category: string) => {
    const lower = category.toLowerCase();
    if (lower.includes("china")) return "pill-china";
    if (lower.includes("russia")) return "pill-russia";
    if (lower.includes("middle") || lower.includes("east")) return "pill-middleeast";
    if (lower.includes("europe")) return "pill-europe";
    if (lower.includes("economy") || lower.includes("trade")) return "pill-economy";
    if (lower.includes("defense") || lower.includes("military")) return "pill-defense";
    if (lower.includes("energy")) return "pill-energy";
    return "pill-world";
  };

  // Extrair categorias únicas
  const categories = [...new Set(favorites.map((f) => f.category))];
  
  // Filtrar favoritos
  const filteredFavorites = filter === "all" 
    ? favorites 
    : favorites.filter((f) => f.category === filter);

  if (!loaded) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="loader" />
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <span className="section-label">Saved Stories</span>
            <h1 className="text-3xl md:text-4xl font-bold text-white mt-4">
              Your Favorites
            </h1>
            <p className="text-[var(--text-secondary)] mt-2">
              {favorites.length} {favorites.length === 1 ? "story" : "stories"} saved
            </p>
          </div>

          {favorites.length > 0 && (
            <button
              onClick={() => setShowConfirmClear(true)}
              className="btn btn-ghost text-red-400 hover:text-red-300 hover:bg-red-400/10"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Confirm Clear Modal */}
        {showConfirmClear && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="card p-6 max-w-sm mx-4">
              <h3 className="text-xl font-bold text-white mb-2">Clear all favorites?</h3>
              <p className="text-[var(--text-secondary)] mb-6">
                This will remove all {favorites.length} saved stories. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmClear(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    clearAll();
                    setShowConfirmClear(false);
                  }}
                  className="btn bg-red-500 hover:bg-red-600 text-white flex-1"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {favorites.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-20 h-20 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center mx-auto mb-6">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--text-muted)]">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">No favorites yet</h2>
            <p className="text-[var(--text-secondary)] max-w-md mx-auto">
              When you find a story you want to save for later, click the star icon to add it here.
            </p>
          </div>
        ) : (
          <>
            {/* Filters */}
            {categories.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  onClick={() => setFilter("all")}
                  className={`pill ${filter === "all" ? "bg-[var(--accent-primary)] text-black" : "bg-[var(--bg-elevated)] text-[var(--text-secondary)]"}`}
                >
                  All ({favorites.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`pill ${filter === cat ? "bg-[var(--accent-primary)] text-black" : getCategoryPillClass(cat)}`}
                  >
                    {cat} ({favorites.filter((f) => f.category === cat).length})
                  </button>
                ))}
              </div>
            )}

            {/* Favorites List */}
            <div className="space-y-4">
              {filteredFavorites.map((story, index) => (
                <article
                  key={story.id}
                  className="card p-5 group animate-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-4">
                    {/* Number */}
                    <div className="w-8 h-8 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-[var(--text-muted)]">
                        {index + 1}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`pill ${getCategoryPillClass(story.category)}`}>
                          {story.category}
                        </span>
                        <span className="text-xs text-[var(--text-muted)]">
                          Saved {new Date(story.savedAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[var(--accent-primary)] transition-colors">
                        {story.title}
                      </h3>
                      
                      <p className="text-[var(--text-secondary)] text-sm mb-3 truncate-3">
                        {story.summary}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                          <span>{story.source}</span>
                          <span>•</span>
                          <span>From {story.briefingDate}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Read More */}
                          {story.sourceUrl && (
                            <a
                              href={story.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-[var(--accent-primary)] hover:underline"
                            >
                              Read source →
                            </a>
                          )}
                          
                          {/* Remove Button */}
                          <button
                            onClick={() => removeFavorite(story.id)}
                            className="p-2 text-[var(--text-muted)] hover:text-red-400 transition-colors"
                            title="Remove from favorites"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        {/* Info Note */}
        <div className="mt-12 p-4 bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)]">
          <p className="text-sm text-[var(--text-muted)] text-center">
            💡 Favorites are stored locally on this device. They won't sync across devices.
          </p>
        </div>
      </div>
    </main>
  );
}
