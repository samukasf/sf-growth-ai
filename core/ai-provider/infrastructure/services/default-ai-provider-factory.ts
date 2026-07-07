import type { AIProviderFactory } from "../../domain/ports/ai-provider-factory.port";
import type { AIProvider } from "../../domain/ports/ai-provider.port";
import type { AIProviderType } from "../../shared";
import {
  AnthropicProvider,
  AwsBedrockProvider,
  AzureOpenAIProvider,
  CustomProvider,
  GeminiProvider,
  LocalModelProvider,
  OpenAIProvider,
} from "../../providers";

export class DefaultAIProviderFactory implements AIProviderFactory {
  private readonly creators: Record<AIProviderType, () => AIProvider> = {
    openai: () => new OpenAIProvider(),
    anthropic: () => new AnthropicProvider(),
    gemini: () => new GeminiProvider(),
    local: () => new LocalModelProvider(),
    azure_openai: () => new AzureOpenAIProvider(),
    aws_bedrock: () => new AwsBedrockProvider(),
    custom: () => new CustomProvider(),
  };

  create(type: AIProviderType, config?: Record<string, string>): AIProvider {
    if (type === "custom" && config?.id) {
      return new CustomProvider(config.id, config.name ?? "Provider Personalizado");
    }
    return this.creators[type]();
  }

  createAll(): AIProvider[] {
    return (Object.keys(this.creators) as AIProviderType[]).map((type) => this.create(type));
  }

  supports(type: AIProviderType): boolean {
    return type in this.creators;
  }
}
