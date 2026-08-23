export type SamuelLiveProviderName = "openai" | "gemini";

export const DEFAULT_SAMUEL_LIVE_PROVIDER: SamuelLiveProviderName = "openai";
export const DEFAULT_GEMINI_LIVE_MODEL = "gemini-3.1-flash-live-preview";

export class InvalidLiveProviderError extends Error {
  readonly code = "LIVE_PROVIDER_INVALID";

  constructor(provider: string) {
    super(`Provedor Live inválido: ${provider}`);
    this.name = "InvalidLiveProviderError";
  }
}

export function resolveSamuelLiveProvider(
  env: NodeJS.ProcessEnv = process.env,
): SamuelLiveProviderName {
  const provider = (env.SAMUEL_LIVE_PROVIDER?.trim().toLowerCase() ||
    DEFAULT_SAMUEL_LIVE_PROVIDER) as string;

  if (provider !== "openai" && provider !== "gemini") {
    throw new InvalidLiveProviderError(provider);
  }

  return provider;
}

export function resolveGeminiLiveModel(env: NodeJS.ProcessEnv = process.env) {
  return env.GEMINI_LIVE_MODEL?.trim() || DEFAULT_GEMINI_LIVE_MODEL;
}

export function liveProviderReadiness(env: NodeJS.ProcessEnv = process.env) {
  const provider = resolveSamuelLiveProvider(env);

  if (provider === "gemini") {
    return {
      provider,
      configured: Boolean(env.GEMINI_API_KEY?.trim()),
      model: resolveGeminiLiveModel(env),
      missingKey: env.GEMINI_API_KEY?.trim() ? null : "GEMINI_API_KEY",
    } as const;
  }

  return {
    provider,
    configured: Boolean(env.OPENAI_API_KEY?.trim()),
    model: env.OPENAI_REALTIME_MODEL?.trim() || "gpt-realtime-2.1",
    missingKey: env.OPENAI_API_KEY?.trim() ? null : "OPENAI_API_KEY",
  } as const;
}
