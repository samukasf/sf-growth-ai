export type AIProviderRole = "system" | "user" | "assistant";

export type AIProviderMessage = {
  role: AIProviderRole;
  content: string;
};

export type AIProviderCapability =
  | "chat"
  | "completion"
  | "embeddings"
  | "vision"
  | "tools";

export type AIProviderRequest = {
  messages: AIProviderMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  metadata?: Record<string, string>;
};

export type AIProviderResponse = {
  content: string;
  model: string;
  providerId: string;
  finishReason?: "stop" | "length" | "error";
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
};

export type AIProviderInfo = {
  id: string;
  name: string;
  capabilities: AIProviderCapability[];
  local: boolean;
};

export interface AIProvider {
  readonly info: AIProviderInfo;
  isAvailable(): Promise<boolean>;
  complete(request: AIProviderRequest): Promise<AIProviderResponse>;
}

export class AIProviderUnavailableError extends Error {
  constructor(providerId: string) {
    super(`AI provider "${providerId}" is not available in this sprint.`);
    this.name = "AIProviderUnavailableError";
  }
}

export type AIProviderRegistry = {
  register(provider: AIProvider): void;
  get(providerId: string): AIProvider | null;
  list(): AIProviderInfo[];
  getDefault(): AIProvider | null;
};

export function createAIProviderRegistry(): AIProviderRegistry {
  const providers = new Map<string, AIProvider>();

  return {
    register(provider) {
      providers.set(provider.info.id, provider);
    },
    get(providerId) {
      return providers.get(providerId) ?? null;
    },
    list() {
      return [...providers.values()].map((provider) => provider.info);
    },
    getDefault() {
      const first = providers.values().next().value as AIProvider | undefined;
      return first ?? null;
    },
  };
}
