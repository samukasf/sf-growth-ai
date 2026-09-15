import { describe, expect, it, vi } from "vitest";

import {
  InvalidTtsProviderError,
  generateSamuelSpeech,
  resolveSamuelTtsProvider,
  ttsProviderReadiness,
} from "./samuel-tts-gateway";

function env(overrides: Partial<NodeJS.ProcessEnv> = {}): NodeJS.ProcessEnv {
  return { NODE_ENV: "test", ...overrides };
}

function audioResponse(requestId: string) {
  return new Response(new Uint8Array([73, 68, 51, 4]), {
    status: 200,
    headers: {
      "content-type": "audio/mpeg",
      "request-id": requestId,
    },
  });
}

describe("resolveSamuelTtsProvider", () => {
  it("prefere ElevenLabs em modo automático quando a chave existe", () => {
    expect(resolveSamuelTtsProvider(env({
      ELEVENLABS_API_KEY: "eleven-secret",
      OPENAI_API_KEY: "openai-secret",
    }))).toBe("elevenlabs");
  });

  it("respeita a seleção explícita do fallback OpenAI", () => {
    expect(resolveSamuelTtsProvider(env({
      SAMUEL_TTS_PROVIDER: "openai",
      ELEVENLABS_API_KEY: "eleven-secret",
      OPENAI_API_KEY: "openai-secret",
    }))).toBe("openai");
  });

  it("recusa um provedor inválido", () => {
    expect(() => resolveSamuelTtsProvider(env({ SAMUEL_TTS_PROVIDER: "unknown" })))
      .toThrow(InvalidTtsProviderError);
  });
});

describe("ttsProviderReadiness", () => {
  it("expõe somente configuração segura e preserva a ordem de failover", () => {
    const readiness = ttsProviderReadiness(env({
      ELEVENLABS_API_KEY: "never-return-this",
      OPENAI_API_KEY: "never-return-this-either",
      ELEVENLABS_VOICE_ID: "voice-samuel",
      ELEVENLABS_VOICE_NAME: "Samuel",
    }));

    expect(readiness.order).toEqual(["elevenlabs", "openai"]);
    expect(readiness.elevenlabs).toMatchObject({
      configured: true,
      voiceName: "Samuel",
      customVoice: true,
    });
    expect(JSON.stringify(readiness)).not.toContain("never-return-this");
  });
});

describe("generateSamuelSpeech", () => {
  it("gera português com ElevenLabs sem enviar a chave ao cliente", async () => {
    const fetcher = vi.fn<typeof fetch>(async () => audioResponse("eleven-request"));

    const result = await generateSamuelSpeech({
      text: "Bom dia, vamos crescer.",
      env: env({
        ELEVENLABS_API_KEY: "eleven-secret",
        ELEVENLABS_VOICE_ID: "voice-samuel",
        ELEVENLABS_MODEL_ID: "eleven_flash_v2_5",
      }),
      fetcher,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("Expected a successful generation");
    expect(result).toMatchObject({
      provider: "elevenlabs",
      model: "eleven_flash_v2_5",
      voice: "voice-samuel",
      requestId: "eleven-request",
      fallback: false,
      attempts: [],
    });

    const [request, init] = fetcher.mock.calls[0];
    expect(String(request)).toBe(
      "https://api.elevenlabs.io/v1/text-to-speech/voice-samuel?output_format=mp3_44100_128",
    );
    expect(init?.headers).toMatchObject({
      Accept: "audio/mpeg",
      "Content-Type": "application/json",
      "xi-api-key": "eleven-secret",
    });
    expect(JSON.parse(String(init?.body))).toEqual({
      text: "Bom dia, vamos crescer.",
      model_id: "eleven_flash_v2_5",
      language_code: "pt",
      voice_settings: {
        stability: 0.48,
        similarity_boost: 0.78,
        style: 0.18,
        speed: 1.03,
        use_speaker_boost: true,
      },
    });
  });

  it("usa OpenAI automaticamente quando ElevenLabs falha", async () => {
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json(
        { detail: { message: "quota exceeded" } },
        { status: 429, headers: { "request-id": "eleven-failed" } },
      ))
      .mockResolvedValueOnce(audioResponse("openai-request"));

    const result = await generateSamuelSpeech({
      text: "Resumo executivo.",
      env: env({
        ELEVENLABS_API_KEY: "eleven-secret",
        OPENAI_API_KEY: "openai-secret",
      }),
      fetcher,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("Expected OpenAI failover to succeed");
    expect(result.provider).toBe("openai");
    expect(result.fallback).toBe(true);
    expect(result.attempts).toEqual([
      expect.objectContaining({
        provider: "elevenlabs",
        status: 429,
        code: "ELEVENLABS_RATE_LIMITED",
        requestId: "eleven-failed",
      }),
    ]);

    const [request, init] = fetcher.mock.calls[1];
    expect(request).toBe("https://api.openai.com/v1/audio/speech");
    expect(init?.headers).toMatchObject({ Authorization: "Bearer openai-secret" });
  });

  it("não chama provedor algum quando não há chaves", async () => {
    const fetcher = vi.fn<typeof fetch>();
    const result = await generateSamuelSpeech({
      text: "Teste.",
      env: env(),
      fetcher,
    });

    expect(result).toEqual({
      ok: false,
      status: 503,
      code: "TTS_NOT_CONFIGURED",
      attempts: [],
    });
    expect(fetcher).not.toHaveBeenCalled();
  });
});
