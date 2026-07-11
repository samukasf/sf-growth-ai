export type AIRequestId = string;
export type AIResponseId = string;
export type AIUsageId = string;
export type AITokenUsageId = string;
export type AIProviderMetricsId = string;
export type AIProviderId = string;
export type OrganizationId = string;
export type DomainEventId = string;

/**
 * Providers conhecidos "de fábrica". Não é uma lista exaustiva: o Provider
 * Catalog (`providers/provider-catalog.ts`) aceita qualquer `AIProviderType`
 * registrado em runtime, então novos providers (ex.: um LLM futuro) não
 * exigem alterar este arquivo — apenas registrar um blueprint novo.
 */
export const KNOWN_AI_PROVIDER_TYPES = [
  "openai",
  "anthropic",
  "gemini",
  "deepseek",
  "grok",
  "ollama",
  "local",
  "azure_openai",
  "aws_bedrock",
  "custom",
] as const;

export type KnownAIProviderType = (typeof KNOWN_AI_PROVIDER_TYPES)[number];

/**
 * União "solta": preserva autocomplete dos tipos conhecidos, mas aceita
 * qualquer string para permitir novos providers sem editar este tipo.
 */
export type AIProviderType = KnownAIProviderType | (string & {});
