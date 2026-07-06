import type { AIProviderPort } from "../../application/ports/integration";

export class NoopAIProviderAdapter implements AIProviderPort {
  isAvailable(): boolean {
    return false;
  }
}
