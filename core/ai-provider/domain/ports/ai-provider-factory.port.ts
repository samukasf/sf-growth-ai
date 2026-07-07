import type { AIProvider } from "./ai-provider.port";
import type { AIProviderType } from "../../shared";

export interface AIProviderFactory {
  create(type: AIProviderType, config?: Record<string, string>): AIProvider;
  createAll(): AIProvider[];
  supports(type: AIProviderType): boolean;
}
