export type AIRequestId = string;
export type AIResponseId = string;
export type AIUsageId = string;
export type AITokenUsageId = string;
export type AIProviderMetricsId = string;
export type AIProviderId = string;
export type OrganizationId = string;
export type DomainEventId = string;

export type AIProviderType =
  | "openai"
  | "anthropic"
  | "gemini"
  | "local"
  | "azure_openai"
  | "aws_bedrock"
  | "custom";
