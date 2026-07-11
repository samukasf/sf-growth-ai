import type { AIProviderType } from "../shared";
import { OpenAICompatibleProvider } from "./openai-compatible-provider";
import { registerAIProviderBlueprint } from "./provider-catalog";

export class OpenAIProvider extends OpenAICompatibleProvider {
  readonly id = "openai";
  readonly type: AIProviderType = "openai";
  readonly name = "OpenAI";

  protected readonly apiKeyEnvVar = "OPENAI_API_KEY";
  protected readonly modelEnvVar = "OPENAI_MODEL";
  protected readonly defaultModel = "gpt-4o-mini";
  protected readonly baseUrl = "https://api.openai.com/v1";
}

registerAIProviderBlueprint({
  type: "openai",
  label: "OpenAI",
  create: () => new OpenAIProvider(),
});
