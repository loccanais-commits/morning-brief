/**
 * ElevenLabs TTS Integration
 * 
 * OTIMIZADO PARA ECONOMIA:
 * - Modelo Flash: 0.5 credit/char (metade do preço!)
 * - Plano $5/mês = 30k credits = 60k chars com Flash
 * - Script ~900 chars/dia = 450 credits/dia = 13.5k/mês
 * - SOBRA: 16.5k credits/mês
 */

const ELEVENLABS_API = "https://api.elevenlabs.io/v1";

// Modelos disponíveis
export const MODELS = {
  // RECOMENDADO: Flash é 50% mais barato
  flash: "eleven_flash_v2_5",        // 0.5 credit/char - MAIS BARATO
  multilingual: "eleven_multilingual_v2", // 1 credit/char
  turbo: "eleven_turbo_v2_5",        // 0.5 credit/char
} as const;

// Vozes recomendadas para notícias
export const VOICES = {
  // Masculinas
  george: "JBFqnCBsd6RMkjVDRZzb", // British, authoritative (da documentação)
  adam: "pNInz6obpgDQGcFmaJgB",   // Deep, authoritative
  josh: "TxGEqnHWrfWFTfGW9XjX",   // Clear, professional
  
  // Femininas  
  rachel: "21m00Tcm4TlvDq8ikWAM", // Calm, professional
  bella: "EXAVITQu4vr4xnSDxMaL",  // Friendly, clear
} as const;

interface ElevenLabsOptions {
  voiceId?: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  modelId?: string;
}

/**
 * Gera áudio com ElevenLabs
 */
export async function generateElevenLabsAudio(
  text: string,
  options: ElevenLabsOptions = {}
): Promise<Buffer | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  
  if (!apiKey) {
    console.warn("[ElevenLabs] API key not configured, falling back to Polly");
    return null;
  }

  const {
    voiceId = VOICES.george, // Voz britânica profissional
    stability = 0.5,
    similarityBoost = 0.75,
    style = 0.3,
    modelId = MODELS.flash, // FLASH = 50% mais barato!
  } = options;

  // Calcular custo estimado
  const estimatedCredits = modelId.includes("flash") || modelId.includes("turbo") 
    ? Math.ceil(text.length * 0.5) 
    : text.length;
  
  console.log(`[ElevenLabs] Generating audio: ${text.length} chars, ~${estimatedCredits} credits`);

  try {
    const response = await fetch(
      `${ELEVENLABS_API}/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "Accept": "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          voice_settings: {
            stability,
            similarity_boost: similarityBoost,
            style,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error("[ElevenLabs] API error:", error);
      
      if (response.status === 401) {
        throw new Error("Invalid API key");
      }
      if (response.status === 429) {
        throw new Error("Rate limit or quota exceeded");
      }
      
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    console.log(`[ElevenLabs] Generated ${arrayBuffer.byteLength} bytes`);
    
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error("[ElevenLabs] Error:", error);
    return null;
  }
}

/**
 * Verifica uso da quota
 */
export async function getElevenLabsUsage(): Promise<{
  characterCount: number;
  characterLimit: number;
  remainingCharacters: number;
} | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  
  if (!apiKey) return null;

  try {
    const response = await fetch(`${ELEVENLABS_API}/user/subscription`, {
      headers: { "xi-api-key": apiKey },
    });

    if (!response.ok) return null;

    const data = await response.json();
    
    return {
      characterCount: data.character_count || 0,
      characterLimit: data.character_limit || 30000,
      remainingCharacters: (data.character_limit || 30000) - (data.character_count || 0),
    };
  } catch {
    return null;
  }
}

/**
 * Lista vozes disponíveis
 */
export async function listVoices(): Promise<Array<{ voiceId: string; name: string }>> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  
  if (!apiKey) return [];

  try {
    const response = await fetch(`${ELEVENLABS_API}/voices`, {
      headers: { "xi-api-key": apiKey },
    });

    if (!response.ok) return [];

    const data = await response.json();
    
    return (data.voices || []).map((v: Record<string, string>) => ({
      voiceId: v.voice_id,
      name: v.name,
    }));
  } catch {
    return [];
  }
}

/**
 * Estima caracteres de um texto
 */
export function estimateCharacters(text: string): number {
  return text.length;
}

/**
 * Formata texto para TTS (remove caracteres problemáticos)
 */
export function formatTextForTTS(text: string): string {
  return text
    // Remove URLs
    .replace(/https?:\/\/[^\s]+/g, "")
    // Remove caracteres especiais
    .replace(/[<>]/g, "")
    // Normaliza aspas
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    // Remove múltiplos espaços
    .replace(/\s+/g, " ")
    .trim();
}
