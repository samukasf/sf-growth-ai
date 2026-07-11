import type { AIProviderType } from "../shared";
import { BaseAIProvider } from "./base-ai-provider";
import { registerAIProviderBlueprint } from "./provider-catalog";

/**
 * Providers ainda sem implementação real (sem API pública padronizada ou sem
 * demanda imediata). Herdam o comportamento simulado de `BaseAIProvider` até
 * que uma implementação real seja necessária — seguindo o mesmo padrão de
 * `OpenAIProvider`/`AnthropicProvider`/`GeminiProvider` antes desta etapa.
 */
export class LocalModelProvider extends BaseAIProvider {
  readonly id = "local";
  readonly type: AIProviderType = "local";
  readonly name = "Modelo Local";
}

export class AzureOpenAIProvider extends BaseAIProvider {
  readonly id = "azure_openai";
  readonly type: AIProviderType = "azure_openai";
  readonly name = "Azure OpenAI";
}

export class AwsBedrockProvider extends BaseAIProvider {
  readonly id = "aws_bedrock";
  readonly type: AIProviderType = "aws_bedrock";
  readonly name = "AWS Bedrock";
}

export class CustomProvider extends BaseAIProvider {
  readonly id: string;
  readonly type: AIProviderType = "custom";
  readonly name: string;

  constructor(id = "custom", name = "Provider Personalizado") {
    super();
    this.id = id;
    this.name = name;
  }
}

registerAIProviderBlueprint({
  type: "local",
  label: "Modelo Local",
  create: () => new LocalModelProvider(),
});

registerAIProviderBlueprint({
  type: "azure_openai",
  label: "Azure OpenAI",
  create: () => new AzureOpenAIProvider(),
});

registerAIProviderBlueprint({
  type: "aws_bedrock",
  label: "AWS Bedrock",
  create: () => new AwsBedrockProvider(),
});

registerAIProviderBlueprint({
  type: "custom",
  label: "Provider Personalizado",
  create: (config) =>
    config?.id ? new CustomProvider(config.id, config.name ?? "Provider Personalizado") : new CustomProvider(),
});
