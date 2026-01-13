/**
 * API Route: Test Amazon Polly TTS
 * 
 * GET /api/tts/test - Gera um áudio de teste
 * POST /api/tts/test - Gera áudio com texto customizado
 */

import { NextResponse } from "next/server";
import { PollyClient, SynthesizeSpeechCommand, Engine, OutputFormat, TextType, VoiceId } from "@aws-sdk/client-polly";

const pollyClient = new PollyClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function GET() {
  const testText = `
    Good morning. Here's your daily briefing from Morning Brief.
    
    Today's top story: Global markets are showing mixed signals as investors await the Federal Reserve's upcoming decision on interest rates. 
    
    What to watch: Expect volatility in the coming days as economic data releases continue.
    
    That's your Morning Brief for today.
  `.trim();

  return generateAudio(testText);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    return generateAudio(text);
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

async function generateAudio(text: string) {
  // Verificar credenciais
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    return NextResponse.json(
      { error: "AWS credentials not configured" },
      { status: 500 }
    );
  }

  try {
    // SSML com estilo Newscaster para voz de notícias
    const ssmlText = `
      <speak>
        <amazon:domain name="news">
          ${escapeSSML(text)}
        </amazon:domain>
      </speak>
    `.trim();

    const command = new SynthesizeSpeechCommand({
      Text: ssmlText,
      TextType: TextType.SSML,
      OutputFormat: OutputFormat.MP3,
      VoiceId: VoiceId.Joanna, // Voz feminina americana com Newscaster
      Engine: Engine.NEURAL,
      SampleRate: "24000",
    });

    const response = await pollyClient.send(command);

    if (!response.AudioStream) {
      return NextResponse.json(
        { error: "No audio stream returned" },
        { status: 500 }
      );
    }

    // Converter stream para buffer
    const audioBuffer = await streamToBuffer(response.AudioStream);
    
    // Converter para Uint8Array para compatibilidade com NextResponse
    const uint8Array = new Uint8Array(audioBuffer);

    // Retornar áudio como MP3
    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": uint8Array.length.toString(),
        "Content-Disposition": 'inline; filename="briefing.mp3"',
      },
    });
  } catch (error) {
    console.error("[TTS] Polly error:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate audio",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

function escapeSSML(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function streamToBuffer(stream: unknown): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  
  // Handle different stream types
  if (stream instanceof Blob) {
    const arrayBuffer = await stream.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
  
  // For Node.js Readable streams
  const readable = stream as AsyncIterable<Uint8Array>;
  for await (const chunk of readable) {
    chunks.push(chunk);
  }
  
  return Buffer.concat(chunks);
}
