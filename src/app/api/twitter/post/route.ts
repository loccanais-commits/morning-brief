import { NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY!,
  appSecret: process.env.TWITTER_API_SECRET!,
  accessToken: process.env.TWITTER_ACCESS_TOKEN!,
  accessSecret: process.env.TWITTER_ACCESS_SECRET!,
});

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const tweet = await client.v2.tweet(text);

    return NextResponse.json({
      success: true,
      tweetId: tweet.data.id,
      url: `https://twitter.com/i/web/status/${tweet.data.id}`,
    });
  } catch (error) {
    console.error("Twitter error:", error);
    return NextResponse.json(
      { error: "Failed to post tweet" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const configured = !!(
    process.env.TWITTER_API_KEY &&
    process.env.TWITTER_ACCESS_TOKEN
  );

  return NextResponse.json({ configured });
}
