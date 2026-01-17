/**
 * TheNewsAPI Integration - Multi-Category System
 * 
 * 6 categorias × 3 requests = 18 requests/dia
 * 18 requests × 3 artigos = ~54 notícias (Free tier)
 * Após deduplicação: ~35-40 notícias únicas
 */

export interface NewsArticle {
  uuid: string;
  title: string;
  description: string;
  snippet: string;
  url: string;
  imageUrl: string;
  source: string;
  publishedAt: string;
  categories: string[];
  locale?: string;
}

export interface CategoryArticles {
  category: string;
  displayName: string;
  emoji: string;
  articles: NewsArticle[];
}

const API_BASE = "https://api.thenewsapi.com/v1/news";

/**
 * Definição das 6 categorias com suas queries
 */
export const CATEGORIES = {
  china: {
    name: "china",
    displayName: "China & Asia",
    emoji: "🇨🇳",
    queries: [
      "China | Beijing | Xi Jinping | CCP",
      "Taiwan | South China Sea | Hong Kong",
      "North Korea | Kim Jong | Japan | Asia Pacific",
    ],
  },
  russia: {
    name: "russia", 
    displayName: "Russia & Europe",
    emoji: "🇷🇺",
    queries: [
      "Russia | Putin | Kremlin | Moscow",
      "Ukraine | Kyiv | Zelensky | war",
      "NATO | EU | Europe | Germany | France",
    ],
  },
  middleeast: {
    name: "middleeast",
    displayName: "Middle East",
    emoji: "🇮🇱",
    queries: [
      "Israel | Gaza | Hamas | Netanyahu",
      "Iran | Tehran | Hezbollah | Lebanon",
      "Saudi Arabia | Syria | Yemen | Gulf",
    ],
  },
  economy: {
    name: "economy",
    displayName: "Economy & Trade",
    emoji: "💰",
    queries: [
      "tariffs | trade war | sanctions | import",
      "Federal Reserve | interest rates | inflation | dollar",
      "markets | stocks | economy | GDP | recession",
    ],
  },
  defense: {
    name: "defense",
    displayName: "Defense & Security",
    emoji: "🛡️",
    queries: [
      "military | Pentagon | defense | troops",
      "nuclear | missiles | weapons | arms",
      "cybersecurity | espionage | intelligence | CIA",
    ],
  },
  technology: {
    name: "technology",
    displayName: "Technology",
    emoji: "💻",
    queries: [
      "AI | artificial intelligence | OpenAI | chips",
      "semiconductors | TSMC | Nvidia | tech war",
      "Huawei | TikTok | cyber | data | tech regulation",
    ],
  },
} as const;

export type CategoryName = keyof typeof CATEGORIES;

/**
 * Busca notícias de TODAS as categorias
 * Total: 18 requests (3 por categoria × 6 categorias)
 * @param targetDate - Optional: fetch news from a specific date (for historical generation)
 */
export async function fetchAllCategoriesNews(targetDate?: string): Promise<{
  byCategory: Record<CategoryName, NewsArticle[]>;
  all: NewsArticle[];
}> {
  const apiKey = process.env.THENEWSAPI_KEY;
  if (!apiKey) throw new Error("THENEWSAPI_KEY not configured");

  let publishedAfter: string;
  let publishedBefore: string | undefined;

  if (targetDate) {
    // For historical generation: fetch news from that specific date
    const targetDateObj = new Date(targetDate + "T00:00:00Z");
    const dayBefore = new Date(targetDateObj);
    dayBefore.setDate(dayBefore.getDate() - 1);
    publishedAfter = dayBefore.toISOString().slice(0, 19);
    publishedBefore = new Date(targetDate + "T23:59:59Z").toISOString().slice(0, 19);
  } else {
    // Default: last 24 hours
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);
    publishedAfter = yesterday.toISOString().slice(0, 19);
  }

  console.log(`[NewsAPI] Starting multi-category fetch (18 requests)...`);

  const byCategory: Record<CategoryName, NewsArticle[]> = {
    china: [],
    russia: [],
    middleeast: [],
    economy: [],
    defense: [],
    technology: [],
  };

  const allUrls = new Set<string>();
  const allArticles: NewsArticle[] = [];
  let totalRequests = 0;

  // Buscar cada categoria
  for (const [catKey, catConfig] of Object.entries(CATEGORIES)) {
    const categoryName = catKey as CategoryName;
    const categoryUrls = new Set<string>();

    console.log(`[NewsAPI] Fetching ${catConfig.displayName}...`);

    for (const query of catConfig.queries) {
      try {
        const params = new URLSearchParams({
          api_token: apiKey,
          locale: "us",
          language: "en",
          categories: "politics,general,business,world,tech",
          published_after: publishedAfter,
          search: query,
          sort: "published_at",
          limit: "50",
        });

        // Add published_before for historical queries
        if (publishedBefore) {
          params.set("published_before", publishedBefore);
        }

        const response = await fetch(`${API_BASE}/top?${params}`, {
          headers: { "Accept": "application/json" },
        });

        totalRequests++;

        if (!response.ok) continue;

        const data = await response.json();

        if (data.data) {
          for (const article of data.data) {
            // Evitar duplicatas dentro da categoria
            if (!categoryUrls.has(article.url)) {
              categoryUrls.add(article.url);
              const mapped = mapArticle(article);
              byCategory[categoryName].push(mapped);

              // Adicionar ao pool global se não existir
              if (!allUrls.has(article.url)) {
                allUrls.add(article.url);
                allArticles.push(mapped);
              }
            }
          }
        }

        // Delay entre requests
        await new Promise(r => setTimeout(r, 150));

      } catch (error) {
        console.error(`[NewsAPI] Error in ${categoryName}:`, error);
      }
    }

    console.log(`[NewsAPI] ${catConfig.displayName}: ${byCategory[categoryName].length} articles`);
  }

  console.log(`[NewsAPI] Complete: ${totalRequests} requests, ${allArticles.length} unique articles`);

  return { byCategory, all: allArticles };
}

/**
 * Busca notícias de UMA categoria específica
 */
export async function fetchCategoryNews(categoryName: CategoryName): Promise<NewsArticle[]> {
  const apiKey = process.env.THENEWSAPI_KEY;
  if (!apiKey) throw new Error("THENEWSAPI_KEY not configured");

  const catConfig = CATEGORIES[categoryName];
  if (!catConfig) throw new Error(`Unknown category: ${categoryName}`);

  const yesterday = new Date();
  yesterday.setHours(yesterday.getHours() - 24);
  const publishedAfter = yesterday.toISOString().slice(0, 19);

  const seenUrls = new Set<string>();
  const articles: NewsArticle[] = [];

  for (const query of catConfig.queries) {
    try {
      const params = new URLSearchParams({
        api_token: apiKey,
        locale: "us",
        language: "en",
        categories: "politics,general,business,world,tech",
        published_after: publishedAfter,
        search: query,
        sort: "published_at",
        limit: "50",
      });

      const response = await fetch(`${API_BASE}/top?${params}`);
      if (!response.ok) continue;

      const data = await response.json();

      if (data.data) {
        for (const article of data.data) {
          if (!seenUrls.has(article.url)) {
            seenUrls.add(article.url);
            articles.push(mapArticle(article));
          }
        }
      }

      await new Promise(r => setTimeout(r, 150));
    } catch (error) {
      console.error(`[NewsAPI] Error fetching ${categoryName}:`, error);
    }
  }

  return articles;
}

/**
 * Mapeia artigo da API para nosso formato
 */
function mapArticle(article: Record<string, unknown>): NewsArticle {
  return {
    uuid: (article.uuid as string) || "",
    title: (article.title as string) || "Untitled",
    description: (article.description as string) || "",
    snippet: (article.snippet as string) || "",
    url: (article.url as string) || "",
    imageUrl: (article.image_url as string) || "",
    source: (article.source as string) || "Unknown",
    publishedAt: (article.published_at as string) || new Date().toISOString(),
    categories: (article.categories as string[]) || [],
    locale: article.locale as string,
  };
}

/**
 * Categoriza artigo por tema (fallback se não vier da busca por categoria)
 */
export function categorizeArticle(article: NewsArticle): CategoryName {
  const text = `${article.title} ${article.description}`.toLowerCase();

  if (/china|beijing|xi jinping|taiwan|hong kong|asia|chinese|ccp/.test(text)) return "china";
  if (/russia|moscow|putin|kremlin|ukraine|kyiv|nato|europe/.test(text)) return "russia";
  if (/iran|israel|gaza|hamas|middle east|saudi|syria|hezbollah/.test(text)) return "middleeast";
  if (/tariff|trade|sanction|economy|market|fed|inflation|dollar/.test(text)) return "economy";
  if (/military|defense|pentagon|nuclear|missile|weapon|army/.test(text)) return "defense";
  if (/ai|chip|semiconductor|tech|cyber|huawei|tiktok/.test(text)) return "technology";

  return "economy"; // default
}

/**
 * Remove duplicatas por título similar
 */
export function deduplicateArticles(articles: NewsArticle[]): NewsArticle[] {
  const seen = new Set<string>();

  return articles.filter(article => {
    const normalized = article.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(" ")
      .slice(0, 6)
      .join(" ");

    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}

/**
 * Ordena artigos por importância (fontes premium primeiro)
 */
export function rankArticles(articles: NewsArticle[]): NewsArticle[] {
  const premiumSources = [
    "reuters", "apnews", "bbc", "nytimes", "wsj",
    "ft", "economist", "politico", "aljazeera",
    "nbcnews", "cbsnews", "foxnews", "cnn", "bloomberg"
  ];

  return [...articles].sort((a, b) => {
    const aScore = premiumSources.some(s => a.source.toLowerCase().includes(s)) ? 10 : 0;
    const bScore = premiumSources.some(s => b.source.toLowerCase().includes(s)) ? 10 : 0;

    if (aScore === bScore) {
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    }

    return bScore - aScore;
  });
}

/**
 * Obtém informações de uma categoria
 */
export function getCategoryInfo(categoryName: CategoryName) {
  return CATEGORIES[categoryName];
}

/**
 * Lista todas as categorias
 */
export function getAllCategories() {
  return Object.entries(CATEGORIES).map(([key, value]) => ({
    key: key as CategoryName,
    displayName: value.displayName,
    emoji: value.emoji,
    queries: value.queries,
  }));
}
