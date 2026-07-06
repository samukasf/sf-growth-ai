import type {
  AIProviderPort,
  AIProviderWisdomRequest,
  AIProviderWisdomResponse,
} from "../../application";

export class NoopAIProviderAdapter implements AIProviderPort {
  async canEnhance(request: AIProviderWisdomRequest): Promise<AIProviderWisdomResponse> {
    void request;
    return {
      available: false,
      reason: "AI Provider Layer not implemented in Sprint 45D",
    };
  }
}
