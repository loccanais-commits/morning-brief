// Types for Morning Brief

export interface Briefing {
  id: string;
  title: string;
  summary: string;
  fullText?: string;
  category: BriefingCategory;
  duration: string; // Format: "1:45"
  audioUrl: string;
  sources: Source[];
  publishedAt: string;
  outlook?: string; // "What to watch next"
  createdAt: Date;
  updatedAt: Date;
}

export type BriefingCategory = 
  | "China"
  | "Russia"
  | "Middle East"
  | "Europe"
  | "Economy"
  | "Defense"
  | "Immigration"
  | "Trade"
  | "Energy"
  | "Technology";

export interface Source {
  name: string;
  url?: string;
  publishedAt?: string;
}

export interface NewsAPIArticle {
  uuid: string;
  title: string;
  description: string;
  keywords: string;
  snippet: string;
  url: string;
  image_url: string;
  language: string;
  published_at: string;
  source: string;
  categories: string[];
  relevance_score: number | null;
}

export interface NewsAPIResponse {
  meta: {
    found: number;
    returned: number;
    limit: number;
    page: number;
  };
  data: NewsAPIArticle[];
}

export interface DailyBriefing {
  date: string;
  briefings: Briefing[];
  totalDuration: string;
  generatedAt: Date;
}

export interface NewsletterSubscriber {
  email: string;
  subscribedAt: Date;
  status: "active" | "unsubscribed";
  source?: string;
}

export interface AudioGenerationRequest {
  text: string;
  voice?: string;
  speed?: number;
  format?: "mp3" | "ogg" | "wav";
}

export interface AudioGenerationResponse {
  audioUrl: string;
  duration: number; // in seconds
  format: string;
}
