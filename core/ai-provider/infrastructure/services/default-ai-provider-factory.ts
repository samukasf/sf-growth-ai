import type { AIProviderFactory } from "../../domain/ports/ai-provider-factory.port";
import type { AIProvider } from "../../domain/ports/ai-provider.port";
import type { AIProviderType } from "../../shared";
import {
  createAllCatalogedAIProviders,
  createCatalogedAIProvider,
  isAIProviderTypeCataloged,
} from "../../providers/provider-catalog";
// Garante que todos os providers "de fábrica" se registrem no catálogo antes
// de qualquer criação — ver `core/ai-provider/providers/index.ts`.
import "../../providers";

/**
 * Fábrica de providers do AI Gateway. Não conhece nenhum provider por nome:
 * delega inteiramente ao Provider Catalog (`core/ai-provider/providers/`).
 * Novos providers não exigem alterar esta classe.
 */
export class DefaultAIProviderFactory implements AIProviderFactory {
  create(type: AIProviderType, config?: Record<string, string>): AIProvider {
    return createCatalogedAIProvider(type, config);
  }

  createAll(): AIProvider[] {
    return createAllCatalogedAIProviders();
  }

  supports(type: AIProviderType): boolean {
    return isAIProviderTypeCataloged(type);
  }
}
