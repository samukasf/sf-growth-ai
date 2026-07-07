import type { AIOperation } from "../../domain";

export type ExecuteAIRequestDto = {
  organizationId: string;
  operation: AIOperation;
  prompt: string;
  model?: string;
  context?: Record<string, string>;
  temperature?: number;
  maxTokens?: number;
  preferredProviderId?: string;
  preferredType?: string;
  enableFallback?: boolean;
  schema?: Record<string, string>;
  categories?: string[];
  targetLanguage?: string;
  sourceLanguage?: string;
};

export type SwitchProviderDto = {
  organizationId: string;
  providerId: string;
  reason?: string;
};

export type CheckProviderHealthDto = {
  organizationId: string;
  providerId?: string;
};
