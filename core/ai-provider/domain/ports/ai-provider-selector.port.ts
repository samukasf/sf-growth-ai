import type { AIProvider } from "./ai-provider.port";
import type { AIOperation } from "../entities";

export type ProviderSelection = {
  provider: AIProvider;
  reason: string;
  fallbackUsed: boolean;
};

export type SelectorConfig = {
  preferredProviderId?: string;
  preferredType?: string;
  operation?: AIOperation;
  enableFallback?: boolean;
};

export interface AIProviderSelector {
  select(providers: AIProvider[], config?: SelectorConfig): ProviderSelection | null;
  selectWithFallback(
    providers: AIProvider[],
    config?: SelectorConfig,
  ): ProviderSelection | null;
}
