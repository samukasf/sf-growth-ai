export type {
  AIProvider,
  AIProviderCapability,
  AIProviderInfo,
  AIProviderMessage,
  AIProviderRegistry,
  AIProviderRequest,
  AIProviderResponse,
  AIProviderRole,
} from "./ai-provider.types";
export {
  AIProviderUnavailableError,
  createAIProviderRegistry,
} from "./ai-provider.types";
export {
  FUTURE_PROVIDER_IDS,
  noopAIProvider,
  NOOP_AI_PROVIDER_ID,
  type FutureProviderId,
} from "./noop-ai-provider";

import { createAIProviderRegistry } from "./ai-provider.types";
import { noopAIProvider } from "./noop-ai-provider";

export const defaultAIProviderRegistry = createAIProviderRegistry();

defaultAIProviderRegistry.register(noopAIProvider);
