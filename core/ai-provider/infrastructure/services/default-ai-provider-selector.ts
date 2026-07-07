import type {
  AIProviderSelector,
  ProviderSelection,
  SelectorConfig,
} from "../../domain/ports/ai-provider-selector.port";
import type { AIProvider } from "../../domain/ports/ai-provider.port";

export class DefaultAIProviderSelector implements AIProviderSelector {
  select(providers: AIProvider[], config?: SelectorConfig): ProviderSelection | null {
    const available = providers.filter((provider) => provider.isAvailable());
    if (available.length === 0) return null;

    if (config?.preferredProviderId) {
      const preferred = available.find((p) => p.id === config.preferredProviderId);
      if (preferred) {
        return { provider: preferred, reason: "Preferred provider", fallbackUsed: false };
      }
    }

    if (config?.preferredType) {
      const byType = available.find((p) => p.type === config.preferredType);
      if (byType) {
        return { provider: byType, reason: "Preferred type", fallbackUsed: false };
      }
    }

    return {
      provider: available[0],
      reason: "Default selection (first available)",
      fallbackUsed: false,
    };
  }

  selectWithFallback(providers: AIProvider[], config?: SelectorConfig): ProviderSelection | null {
    const primary = this.select(providers, config);
    if (primary) return primary;

    if (config?.enableFallback === false) return null;

    const fallback = providers.find((provider) => provider.isAvailable());
    if (!fallback) return null;

    return {
      provider: fallback,
      reason: "Automatic fallback to available provider",
      fallbackUsed: true,
    };
  }
}
