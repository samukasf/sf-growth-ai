import {
  AIProviderUnavailableError,
  type AIProvider,
  type AIProviderResponse,
} from "./ai-provider.types";

export const NOOP_AI_PROVIDER_ID = "noop";

export const noopAIProvider: AIProvider = {
  info: {
    id: NOOP_AI_PROVIDER_ID,
    name: "No-op Provider",
    capabilities: ["chat", "completion"],
    local: true,
  },
  async isAvailable() {
    return false;
  },
  async complete(): Promise<AIProviderResponse> {
    throw new AIProviderUnavailableError(NOOP_AI_PROVIDER_ID);
  },
};

export const FUTURE_PROVIDER_IDS = [
  "openai",
  "claude",
  "gemini",
  "ollama",
  "vllm",
  "llama",
  "mistral",
] as const;

export type FutureProviderId = (typeof FUTURE_PROVIDER_IDS)[number];
