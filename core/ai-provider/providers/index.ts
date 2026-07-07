import type { AIProviderType } from "../shared";
import { BaseAIProvider } from "./base-ai-provider";

export class OpenAIProvider extends BaseAIProvider {
  readonly id = "openai";
  readonly type: AIProviderType = "openai";
  readonly name = "OpenAI";
}

export class AnthropicProvider extends BaseAIProvider {
  readonly id = "anthropic";
  readonly type: AIProviderType = "anthropic";
  readonly name = "Anthropic Claude";
}

export class GeminiProvider extends BaseAIProvider {
  readonly id = "gemini";
  readonly type: AIProviderType = "gemini";
  readonly name = "Google Gemini";
}

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
