import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/auth/server/authorization", () => ({
  authorizeCompanyRequest: vi.fn(),
}));

describe("Samuel ElevenLabs transcription", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.ELEVENLABS_API_KEY = "test-elevenlabs-key";
    delete process.env.ELEVENLABS_TRANSCRIPTION_MODEL;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.ELEVENLABS_API_KEY;
    delete process.env.ELEVENLABS_TRANSCRIPTION_MODEL;
  });

  it("sends captured audio to Scribe v2 in Portuguese", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ text: "Bom dia Samuel" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { transcribeWithElevenLabs } = await import(
      "@/app/api/samuel-ai/transcribe/route"
    );
    const audio = new File([new Uint8Array([1, 2, 3])], "turn.wav", {
      type: "audio/wav",
    });
    const result = await transcribeWithElevenLabs(audio);

    expect(result).toMatchObject({
      ok: true,
      text: "Bom dia Samuel",
      provider: "elevenlabs",
      model: "scribe_v2",
    });
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.elevenlabs.io/v1/speech-to-text");
    expect(init.headers).toEqual({ "xi-api-key": "test-elevenlabs-key" });
    const body = init.body as FormData;
    expect(body.get("model_id")).toBe("scribe_v2");
    expect(body.get("language_code")).toBe("por");
    expect(body.get("file")).toBeInstanceOf(File);
  });

  it("returns a provider error without exposing the API key", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ detail: { message: "subscription disabled" } }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    const { transcribeWithElevenLabs } = await import(
      "@/app/api/samuel-ai/transcribe/route"
    );
    const result = await transcribeWithElevenLabs(
      new File([new Uint8Array([1])], "turn.wav", { type: "audio/wav" }),
    );

    expect(result).toMatchObject({
      ok: false,
      status: 401,
      code: "ELEVENLABS_PROVIDER_ERROR",
      error: "subscription disabled",
    });
    expect(JSON.stringify(result)).not.toContain("test-elevenlabs-key");
  });
});
