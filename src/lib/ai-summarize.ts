/**
 * AI Summarization Service - Multi-Category System
 * 
 * Gera:
 * - 1 Full Briefing (5 min) - todas as categorias
 * - 6 Category Briefs (1-2 min cada) - por categoria
 */

import Anthropic from "@anthropic-ai/sdk";
import { NewsArticle, CategoryName, CATEGORIES, getCategoryInfo } from "./news-api";

// Tipos
export interface NewsStory {
  id: string;
  uuid: string;
  title: string;
  summary: string;
  category: CategoryName;
  categoryDisplay: string;
  source: string;
  sourceUrl: string;
  imageUrl?: string;
  publishedAt: string;
}

export interface CategoryBrief {
  category: CategoryName;
  displayName: string;
  emoji: string;
  headline: string;
  script: string;
  stories: NewsStory[];
  storyCount: number;
  estimatedDuration: string;
}

export interface FullBriefingResult {
  headline: string;
  script: string;
  stories: NewsStory[];
  categoryBriefs: CategoryBrief[];
  totalStories: number;
  estimatedDuration: string;
}

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");
  return new Anthropic({ apiKey });
}

/**
 * Processa TODAS as notícias e gera Full + Category briefs
 */
export async function generateAllBriefings(
  articlesByCategory: Record<CategoryName, NewsArticle[]>
): Promise<FullBriefingResult> {
  const client = getClient();
  
  console.log("[AI] Starting multi-category processing...");

  // 1. Processar cada categoria
  const categoryBriefs: CategoryBrief[] = [];
  const allStories: NewsStory[] = [];

  for (const [catKey, articles] of Object.entries(articlesByCategory)) {
    const categoryName = catKey as CategoryName;
    
    if (articles.length === 0) {
      console.log(`[AI] Skipping ${categoryName} - no articles`);
      continue;
    }

    console.log(`[AI] Processing ${categoryName}: ${articles.length} articles`);

    const categoryBrief = await generateCategoryBrief(client, categoryName, articles);
    categoryBriefs.push(categoryBrief);
    allStories.push(...categoryBrief.stories);
  }

  // 2. Gerar Full Briefing (5 min)
  console.log("[AI] Generating full briefing...");
  const { headline, script } = await generateFullBriefing(client, categoryBriefs);

  const result: FullBriefingResult = {
    headline,
    script,
    stories: allStories,
    categoryBriefs,
    totalStories: allStories.length,
    estimatedDuration: estimateAudioDuration(script),
  };

  console.log(`[AI] Complete: ${allStories.length} stories, ${categoryBriefs.length} category briefs`);

  return result;
}

/**
 * Gera brief para UMA categoria (1-2 min)
 */
async function generateCategoryBrief(
  client: Anthropic,
  categoryName: CategoryName,
  articles: NewsArticle[]
): Promise<CategoryBrief> {
  const catInfo = getCategoryInfo(categoryName);
  const topArticles = articles.slice(0, 6); // Max 6 por categoria

  // Gerar resumos das histórias
  const stories = await generateStorySummaries(client, topArticles, categoryName);

  // Gerar headline da categoria
  const headline = await generateCategoryHeadline(client, stories, catInfo.displayName);

  // Gerar script de 1-2 minutos (~800-1000 chars)
  const script = await generateCategoryScript(client, stories, catInfo.displayName);

  return {
    category: categoryName,
    displayName: catInfo.displayName,
    emoji: catInfo.emoji,
    headline,
    script,
    stories,
    storyCount: stories.length,
    estimatedDuration: estimateAudioDuration(script),
  };
}

/**
 * Gera resumos individuais das histórias
 */
async function generateStorySummaries(
  client: Anthropic,
  articles: NewsArticle[],
  categoryName: CategoryName
): Promise<NewsStory[]> {
  const catInfo = getCategoryInfo(categoryName);

  const articlesText = articles.map((a, i) =>
    `[${i + 1}] ${a.title}\nSource: ${a.source}\n${a.description || a.snippet}`
  ).join("\n\n");

  const prompt = `Summarize each news story in 2-3 sentences. Be factual, engaging and concise.

ARTICLES:
${articlesText}

Return JSON array:
[{"index": 1, "title": "Compelling headline (max 80 chars)", "summary": "2-3 sentence summary with key facts and context"}]

Return ONLY valid JSON.`;

  try {
    const response = await client.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== "text") throw new Error("Unexpected response");

    const jsonMatch = content.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("No JSON found");

    const summaries = JSON.parse(jsonMatch[0]) as Array<{
      index: number;
      title: string;
      summary: string;
    }>;

    return articles.map((article, i) => {
      const summary = summaries.find(s => s.index === i + 1);
      return {
        id: `${categoryName}-${i + 1}`,
        uuid: article.uuid,
        title: summary?.title || article.title.slice(0, 80),
        summary: summary?.summary || article.description.slice(0, 300),
        category: categoryName,
        categoryDisplay: catInfo.displayName,
        source: article.source,
        sourceUrl: article.url,
        imageUrl: article.imageUrl,
        publishedAt: article.publishedAt,
      };
    });

  } catch (error) {
    console.error(`[AI] Summary error for ${categoryName}:`, error);

    // Fallback
    return articles.map((article, i) => ({
      id: `${categoryName}-${i + 1}`,
      uuid: article.uuid,
      title: article.title.slice(0, 80),
      summary: article.description.slice(0, 300) || article.snippet,
      category: categoryName,
      categoryDisplay: catInfo.displayName,
      source: article.source,
      sourceUrl: article.url,
      imageUrl: article.imageUrl,
      publishedAt: article.publishedAt,
    }));
  }
}

/**
 * Gera headline para uma categoria
 */
async function generateCategoryHeadline(
  client: Anthropic,
  stories: NewsStory[],
  categoryDisplayName: string
): Promise<string> {
  const topStories = stories.slice(0, 3).map(s => s.title).join("; ");

  const prompt = `Based on these ${categoryDisplayName} news stories, create a compelling headline.

STORIES:
${topStories}

REQUIREMENTS:
- Maximum 50 characters
- Focus on the biggest story
- News style (CNN, BBC)
- No quotes

Return ONLY the headline text.`;

  try {
    const response = await client.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 60,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== "text") throw new Error("Unexpected");

    return content.text.trim().replace(/^["']|["']$/g, "").slice(0, 50);

  } catch (error) {
    return stories[0]?.title.slice(0, 50) || `${categoryDisplayName} Update`;
  }
}

/**
 * Gera script de 1-2 min para uma categoria
 */
async function generateCategoryScript(
  client: Anthropic,
  stories: NewsStory[],
  categoryDisplayName: string
): Promise<string> {
  const storiesList = stories.map(s => `- ${s.title}: ${s.summary}`).join("\n");

  const prompt = `Write a 1-2 MINUTE audio briefing script for ${categoryDisplayName} news.

STORIES:
${storiesList}

REQUIREMENTS:
1. Opening (5 sec): "Here's your ${categoryDisplayName} update."
2. Cover ${Math.min(stories.length, 4)} stories with 2-3 sentences each
3. Closing (5 sec): "That's your ${categoryDisplayName} brief."
4. Total: 600-1000 characters (1-2 minutes)
5. Conversational, professional tone

Return ONLY the script text.`;

  try {
    const response = await client.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== "text") throw new Error("Unexpected");

    let script = content.text.trim();
    if (script.length > 1200) script = script.slice(0, 1197) + "...";

    return script;

  } catch (error) {
    // Fallback script
    let script = `Here's your ${categoryDisplayName} update.\n\n`;
    stories.slice(0, 3).forEach(s => {
      script += `${s.title}. ${s.summary}\n\n`;
    });
    script += `That's your ${categoryDisplayName} brief.`;
    return script.slice(0, 1000);
  }
}

/**
 * Gera Full Briefing (5 min) combinando todas as categorias
 */
async function generateFullBriefing(
  client: Anthropic,
  categoryBriefs: CategoryBrief[]
): Promise<{ headline: string; script: string }> {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // Construir resumo por categoria
  const categorySummaries = categoryBriefs.map(cb => {
    const topStories = cb.stories.slice(0, 2).map(s => `- ${s.title}`).join("\n");
    return `${cb.emoji} ${cb.displayName}:\n${topStories}`;
  }).join("\n\n");

  // Gerar headline principal
  const allHeadlines = categoryBriefs.map(cb => cb.headline).join("; ");
  
  const headlinePrompt = `Based on today's top news across all categories, create ONE main headline.

CATEGORY HEADLINES:
${allHeadlines}

Requirements: Max 60 chars, punchy, captures the day's biggest story.
Return ONLY the headline.`;

  let headline = "Global News Roundup";
  try {
    const headlineRes = await client.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 80,
      messages: [{ role: "user", content: headlinePrompt }],
    });
    const hContent = headlineRes.content[0];
    if (hContent.type === "text") {
      headline = hContent.text.trim().replace(/^["']|["']$/g, "").slice(0, 60);
    }
  } catch (e) {
    headline = categoryBriefs[0]?.headline || "Global News Roundup";
  }

  // Gerar script de 5 minutos (~3000-3500 chars)
  const scriptPrompt = `Write a 5-MINUTE comprehensive news briefing script.

DATE: ${today}

NEWS BY CATEGORY:
${categorySummaries}

REQUIREMENTS:
1. Opening (15 sec): "Good morning. It's ${today}. Here's your Morning Brief with today's top stories from around the world."

2. Cover EACH category with a section:
   - Use transitions: "Turning to...", "In...", "Meanwhile in...", "On the economic front...", "In tech news..."
   - 2-3 sentences per major story
   - Cover 2-3 stories per category

3. Closing (15 sec): "That's your Morning Brief for ${today}. Check our app for individual category briefs if you want to dive deeper into any topic. Stay informed, and have a great day."

4. Total: 2800-3500 characters (5 minutes of audio)
5. Professional, authoritative tone (NPR/BBC style)
6. Say "United States" not "US", spell out abbreviations

Return ONLY the script text.`;

  let script = "";
  try {
    const scriptRes = await client.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 2000,
      messages: [{ role: "user", content: scriptPrompt }],
    });
    const sContent = scriptRes.content[0];
    if (sContent.type === "text") {
      script = sContent.text.trim();
      if (script.length > 4000) script = script.slice(0, 3997) + "...";
    }
  } catch (error) {
    // Fallback
    script = generateFallbackFullScript(categoryBriefs, today);
  }

  console.log(`[AI] Full briefing: "${headline}" - ${script.length} chars`);

  return { headline, script };
}

/**
 * Fallback script para Full Briefing
 */
function generateFallbackFullScript(categoryBriefs: CategoryBrief[], date: string): string {
  let script = `Good morning. It's ${date}. Here's your Morning Brief.\n\n`;

  categoryBriefs.forEach(cb => {
    script += `${cb.emoji} ${cb.displayName}:\n`;
    cb.stories.slice(0, 2).forEach(s => {
      script += `${s.title}. ${s.summary}\n`;
    });
    script += "\n";
  });

  script += `That's your Morning Brief for ${date}. Stay informed.`;

  return script.slice(0, 3500);
}

/**
 * Estima duração do áudio (150 wpm = ~12 chars/sec)
 */
export function estimateAudioDuration(text: string): string {
  const seconds = Math.round(text.length / 12);
  const minutes = Math.floor(seconds / 60);
  const remainingSecs = seconds % 60;
  return `${minutes}:${remainingSecs.toString().padStart(2, "0")}`;
}

/**
 * Gera conteúdo para UMA categoria apenas (para refresh individual)
 */
export async function generateSingleCategoryContent(
  categoryName: CategoryName,
  articles: NewsArticle[]
): Promise<CategoryBrief> {
  const client = getClient();
  return generateCategoryBrief(client, categoryName, articles);
}
