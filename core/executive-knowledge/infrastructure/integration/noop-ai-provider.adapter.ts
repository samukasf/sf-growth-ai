import type {
  AIProviderKnowledgeRequest,
  AIProviderKnowledgeResponse,
  AIProviderPort,
} from "../../application";

export class NoopAIProviderAdapter implements AIProviderPort {
  async canHandle(request: AIProviderKnowledgeRequest): Promise<AIProviderKnowledgeResponse> {
    void request;
    return {
      available: false,
      reason: "AI Provider Layer not implemented in Sprint 45B",
    };
  }
}
