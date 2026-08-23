import { describe, expect, it } from "vitest";

import {
  DEFAULT_GEMINI_LIVE_MODEL,
  InvalidLiveProviderError,
  liveProviderReadiness,
  resolveGeminiLiveModel,
  resolveSamuelLiveProvider,
} from "./live-provider.server";

describe("Samuel Live provider resolver", () => {
  it("keeps OpenAI as the safe default", () => {
    expect(resolveSamuelLiveProvider({} as NodeJS.ProcessEnv)).toBe("openai");
  });

  it("accepts Gemini explicitly", () => {
    expect(
      resolveSamuelLiveProvider({ SAMUEL_LIVE_PROVIDER: "gemini" } as NodeJS.ProcessEnv),
    ).toBe("gemini");
  });

  it("rejects unknown providers", () => {
    expect(() =>
      resolveSamuelLiveProvider({ SAMUEL_LIVE_PROVIDER: "other" } as NodeJS.ProcessEnv),
    ).toThrow(InvalidLiveProviderError);
  });

  it("uses the current Gemini Live model by default", () => {
    expect(resolveGeminiLiveModel({} as NodeJS.ProcessEnv)).toBe(
      DEFAULT_GEMINI_LIVE_MODEL,
    );
  });

  it("reports missing Gemini credentials without exposing secrets", () => {
    expect(
      liveProviderReadiness({ SAMUEL_LIVE_PROVIDER: "gemini" } as NodeJS.ProcessEnv),
    ).toEqual({
      provider: "gemini",
      configured: false,
      model: DEFAULT_GEMINI_LIVE_MODEL,
      missingKey: "GEMINI_API_KEY",
    });
  });
});
