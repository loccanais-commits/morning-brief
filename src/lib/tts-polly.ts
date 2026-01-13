/**
 * Amazon Polly TTS - Fallback
 * 
 * Usado quando ElevenLabs não está disponível
 */

import { PollyClient, SynthesizeSpeechCommand, Engine, OutputFormat, TextType, VoiceId } from "@aws-sdk/client-polly";

let pollyClient: PollyClient | null = null;

function getPollyClient(): PollyClient | null {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    return null;
  }
  
  if (!pollyClient) {
    pollyClient = new PollyClient({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  
  return pollyClient;
}

/**
 * Gera áudio com Amazon Polly
 */
export async function generatePollyAudio(text: string): Promise<Buffer | null> {
  const client = getPollyClient();
  
  if (!client) {
    console.warn("[Polly] AWS credentials not configured");
    return null;
  }

  try {
    // SSML com estilo Newscaster
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
      VoiceId: VoiceId.Joanna,
      Engine: Engine.NEURAL,
      SampleRate: "24000",
    });

    const response = await client.send(command);

    if (!response.AudioStream) {
      return null;
    }

    return await streamToBuffer(response.AudioStream);
  } catch (error) {
    console.error("[Polly] Error:", error);
    return null;
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
  
  if (stream instanceof Blob) {
    const arrayBuffer = await stream.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
  
  const readable = stream as AsyncIterable<Uint8Array>;
  for await (const chunk of readable) {
    chunks.push(chunk);
  }
  
  return Buffer.concat(chunks);
}
