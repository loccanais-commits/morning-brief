/**
 * Twitter/X posting utility
 * Can be called directly from cron or API routes
 */

import { TwitterApi } from "twitter-api-v2";

export function isTwitterConfigured(): boolean {
  return !!(
    process.env.TWITTER_API_KEY &&
    process.env.TWITTER_API_SECRET &&
    process.env.TWITTER_ACCESS_TOKEN &&
    process.env.TWITTER_ACCESS_SECRET
  );
}

export interface TweetResult {
  success: boolean;
  tweetId?: string;
  url?: string;
  error?: string;
}

export async function postTweet(text: string): Promise<TweetResult> {
  if (!isTwitterConfigured()) {
    return {
      success: false,
      error: "Twitter not configured",
    };
  }

  try {
    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_SECRET!,
      accessToken: process.env.TWITTER_ACCESS_TOKEN!,
      accessSecret: process.env.TWITTER_ACCESS_SECRET!,
    });

    const tweet = await client.v2.tweet(text);

    return {
      success: true,
      tweetId: tweet.data.id,
      url: `https://twitter.com/i/web/status/${tweet.data.id}`,
    };
  } catch (error) {
    console.error("[Twitter] Error posting tweet:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to post tweet",
    };
  }
}
