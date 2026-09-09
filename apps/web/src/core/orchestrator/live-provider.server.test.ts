import { describe, expect, it } from "vitest";

import {
  DEFAULT_GEMINI_LIVE_MODEL,
  InvalidLiveProviderError,
  liveProviderReadiness,
  resolveGeminiLiveModel,
  resolveSamuelLiveProvider,
} from "./live-provider.server";

describe("Samuel Live provider resolver", () => {
  it("defaults to Gemini when no provider is explicitly configured", () => {
    expect(resolveSamuelLiveProvider({} as unknown as NodeJS.ProcessEnv)).toBe("gemini");
  });

  it("prefers Gemini automatically when both API keys exist", () => {
    expect(
      resolveSamuelLiveProvider({
        GEMINI_API_KEY: "gemini-key",
        OPENAI_API_KEY: "openai-key",
      } as unknown as NodeJS.ProcessEnv),
    ).toBe("gemini");
  });

  it("uses OpenAI automatically when Gemini is unavailable", () => {
    expect(
      resolveSamuelLiveProvider({ OPENAI_API_KEY: "openai-key" } as unknown as NodeJS.ProcessEnv),
    ).toBe("openai");
  });

  it("honors an explicit OpenAI selection", () => {
    expect(
      resolveSamuelLiveProvider({
        SAMUEL_LIVE_PROVIDER: "openai",
        GEMINI_API_KEY: "gemini-key",
      } as unknown as NodeJS.ProcessEnv),
    ).toBe("openai");
  });

  it("accepts Gemini explicitly", () => {
    expect(
      resolveSamuelLiveProvider({ SAMUEL_LIVE_PROVIDER: "gemini" } as unknown as NodeJS.ProcessEnv),
    ).toBe("gemini");
  });

  it("rejects unknown providers", () => {
    expect(() =>
      resolveSamuelLiveProvider({ SAMUEL_LIVE_PROVIDER: "other" } as unknown as NodeJS.ProcessEnv),
    ).toThrow(InvalidLiveProviderError);
  });

  it("uses the current Gemini Live model by default", () => {
    expect(resolveGeminiLiveModel({} as unknown as NodeJS.ProcessEnv)).toBe(
      DEFAULT_GEMINI_LIVE_MODEL,
    );
  });

  it("reports missing Gemini credentials without exposing secrets", () => {
    expect(
      liveProviderReadiness({ SAMUEL_LIVE_PROVIDER: "gemini" } as unknown as NodeJS.ProcessEnv),
    ).toEqual({
      provider: "gemini",
      configured: false,
      model: DEFAULT_GEMINI_LIVE_MODEL,
      missingKey: "GEMINI_API_KEY",
    });
  });
});
